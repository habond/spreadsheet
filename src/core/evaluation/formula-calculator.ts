import { FormulaParser, Token } from './formula-parser';
import { EvalResult, GetCellResultFn, FunctionInfo } from '../types';
import {
  CellReferenceError,
  DivisionByZeroError,
  FunctionArgumentError,
  InvalidFunctionError,
  FormulaParseError,
} from '../errors';

type ParseResult = { value: number | string; nextPos: number };

/**
 * Function name constants for type safety
 */
export const FunctionName = {
  // Math functions
  SUM: 'SUM',
  AVERAGE: 'AVERAGE',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
  ADD: 'ADD',
  SUB: 'SUB',
  MUL: 'MUL',
  MULTIPLY: 'MULTIPLY',
  DIV: 'DIV',
  DIVIDE: 'DIVIDE',
  // Logical functions
  IF: 'IF',
  // Count functions
  COUNT: 'COUNT',
  // String functions
  CONCATENATE: 'CONCATENATE',
  CONCAT: 'CONCAT',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TRIM: 'TRIM',
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  // Date/time functions
  NOW: 'NOW',
  TODAY: 'TODAY',
  DATE: 'DATE',
  DATEDIF: 'DATEDIF',
} as const;

export type FunctionNameType = (typeof FunctionName)[keyof typeof FunctionName];

/**
 * Metadata for all supported spreadsheet functions
 */
export const SUPPORTED_FUNCTIONS: FunctionInfo[] = [
  // Math functions
  { name: FunctionName.SUM, description: 'Add all arguments' },
  {
    name: FunctionName.AVERAGE,
    description: 'Calculate average of arguments',
    aliases: [FunctionName.AVG],
  },
  { name: FunctionName.MIN, description: 'Find minimum value' },
  { name: FunctionName.MAX, description: 'Find maximum value' },
  { name: FunctionName.ADD, description: 'Add two numbers' },
  { name: FunctionName.SUB, description: 'Subtract two numbers' },
  { name: FunctionName.MUL, description: 'Multiply two numbers', aliases: [FunctionName.MULTIPLY] },
  { name: FunctionName.DIV, description: 'Divide two numbers', aliases: [FunctionName.DIVIDE] },
  // Logical functions
  { name: FunctionName.IF, description: 'IF(condition, value_if_true, value_if_false)' },
  // Count functions
  { name: FunctionName.COUNT, description: 'Count numeric values' },
  // String functions
  { name: FunctionName.CONCATENATE, description: 'Join text strings' },
  { name: FunctionName.CONCAT, description: 'Join text strings (alias)' },
  { name: FunctionName.LEFT, description: 'LEFT(text, num_chars) - Extract from left' },
  { name: FunctionName.RIGHT, description: 'RIGHT(text, num_chars) - Extract from right' },
  { name: FunctionName.TRIM, description: 'Remove leading/trailing spaces' },
  { name: FunctionName.UPPER, description: 'Convert text to uppercase' },
  { name: FunctionName.LOWER, description: 'Convert text to lowercase' },
  // Date/time functions
  { name: FunctionName.NOW, description: 'Current date and time as timestamp' },
  { name: FunctionName.TODAY, description: 'Current date as timestamp' },
  { name: FunctionName.DATE, description: 'DATE(year, month, day)' },
  { name: FunctionName.DATEDIF, description: 'DATEDIF(start, end, unit)' },
];

/**
 * Computes formula expressions using pre-evaluated cell values.
 * Does NOT orchestrate cell evaluation - that's handled by EvalEngine.
 * Cell references are resolved from already-computed results to prevent
 * infinite loops and ensure correct topological evaluation order.
 */
export class FormulaCalculator {
  private getCellResult: GetCellResultFn;

  constructor(getCellResult: GetCellResultFn) {
    this.getCellResult = getCellResult;
  }

  /**
   * Calculate a formula and return the result.
   * Assumes all referenced cells are already evaluated.
   */
  calculate(formula: string): EvalResult {
    try {
      const tokens = FormulaParser.tokenize(formula);
      const value = this.parseComparison(tokens, 0).value;
      return { value, error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse comparison (lowest precedence: =, <>, <, >, <=, >=)
   */
  private parseComparison(tokens: Token[], pos: number): ParseResult {
    // Parse first expression
    const result = this.parseExpression(tokens, pos);

    // Handle comparison operators
    if (result.nextPos < tokens.length) {
      const token = tokens[result.nextPos];
      if (token.type === 'COMPARISON') {
        const right = this.parseExpression(tokens, result.nextPos + 1);
        const leftNum = typeof result.value === 'number' ? result.value : String(result.value);
        const rightNum = typeof right.value === 'number' ? right.value : String(right.value);

        let compResult: boolean;
        switch (token.value) {
          case '=':
            compResult = leftNum === rightNum;
            break;
          case '<>':
            compResult = leftNum !== rightNum;
            break;
          case '<':
            compResult = this.toNumber(result.value) < this.toNumber(right.value);
            break;
          case '>':
            compResult = this.toNumber(result.value) > this.toNumber(right.value);
            break;
          case '<=':
            compResult = this.toNumber(result.value) <= this.toNumber(right.value);
            break;
          case '>=':
            compResult = this.toNumber(result.value) >= this.toNumber(right.value);
            break;
          default:
            throw new FormulaParseError(`Unknown comparison operator: ${token.value}`);
        }
        // Return 1 for true, 0 for false (like Excel)
        result.value = compResult ? 1 : 0;
        result.nextPos = right.nextPos;
      }
    }

    return result;
  }

  /**
   * Parse an expression (handles operators with precedence)
   */
  private parseExpression(tokens: Token[], pos: number): ParseResult {
    // Parse first term
    const result = this.parseTerm(tokens, pos);

    // Handle addition and subtraction
    while (result.nextPos < tokens.length) {
      const token = tokens[result.nextPos];
      if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
        const right = this.parseTerm(tokens, result.nextPos + 1);
        if (token.value === '+') {
          result.value = this.toNumber(result.value) + this.toNumber(right.value);
        } else {
          result.value = this.toNumber(result.value) - this.toNumber(right.value);
        }
        result.nextPos = right.nextPos;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Parse a term (handles * and / with higher precedence)
   */
  private parseTerm(tokens: Token[], pos: number): ParseResult {
    // Parse first factor
    const result = this.parseFactor(tokens, pos);

    // Handle multiplication and division
    while (result.nextPos < tokens.length) {
      const token = tokens[result.nextPos];
      if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/')) {
        const right = this.parseFactor(tokens, result.nextPos + 1);
        if (token.value === '*') {
          result.value = this.toNumber(result.value) * this.toNumber(right.value);
        } else {
          const divisor = this.toNumber(right.value);
          if (divisor === 0) {
            throw new DivisionByZeroError();
          }
          result.value = this.toNumber(result.value) / divisor;
        }
        result.nextPos = right.nextPos;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Parse a factor (number, cell reference, function, or parenthesized expression)
   */
  private parseFactor(tokens: Token[], pos: number): ParseResult {
    if (pos >= tokens.length) {
      throw new FormulaParseError('Unexpected end of formula');
    }

    const token = tokens[pos];

    // Number literal
    if (token.type === 'NUMBER') {
      return { value: parseFloat(token.value), nextPos: pos + 1 };
    }

    // String literal
    if (token.type === 'STRING') {
      return { value: token.value, nextPos: pos + 1 };
    }

    // Cell reference
    if (token.type === 'CELL_REF') {
      const cellResult = this.getCellResult(token.value);
      if (!cellResult) {
        throw new CellReferenceError(token.value, 'has no value');
      }
      if (cellResult.error) {
        throw new CellReferenceError(token.value, `has error: ${cellResult.error}`);
      }
      if (cellResult.value === null) {
        throw new CellReferenceError(token.value, 'has no value');
      }
      return { value: cellResult.value, nextPos: pos + 1 };
    }

    // Function call
    if (token.type === 'FUNCTION') {
      return this.parseFunction(tokens, pos);
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      const result = this.parseComparison(tokens, pos + 1);
      if (result.nextPos >= tokens.length || tokens[result.nextPos].type !== 'RPAREN') {
        throw new FormulaParseError('Missing closing parenthesis');
      }
      return { value: result.value, nextPos: result.nextPos + 1 };
    }

    throw new FormulaParseError(`Unexpected token: ${token.value}`);
  }

  /**
   * Parse a function call
   */
  private parseFunction(tokens: Token[], pos: number): ParseResult {
    const funcToken = tokens[pos];
    const funcName = funcToken.value;

    // Expect opening parenthesis
    if (pos + 1 >= tokens.length || tokens[pos + 1].type !== 'LPAREN') {
      throw new FormulaParseError(`Expected '(' after function ${funcName}`);
    }

    // Parse arguments
    const args: (number | string)[] = [];
    let currentPos = pos + 2; // Skip function name and '('

    // Check for empty argument list
    if (currentPos < tokens.length && tokens[currentPos].type === 'RPAREN') {
      currentPos++;
    } else {
      // Parse comma-separated arguments
      while (true) {
        const argResult = this.parseComparison(tokens, currentPos);
        args.push(argResult.value);
        currentPos = argResult.nextPos;

        if (currentPos >= tokens.length) {
          throw new FormulaParseError(`Missing closing parenthesis for function ${funcName}`);
        }

        const nextToken = tokens[currentPos];
        if (nextToken.type === 'RPAREN') {
          currentPos++;
          break;
        } else if (nextToken.type === 'COMMA') {
          currentPos++;
          continue;
        } else {
          throw new FormulaParseError(`Expected ',' or ')' in function ${funcName}`);
        }
      }
    }

    // Execute function
    const value = this.executeFunction(funcName, args);
    return { value, nextPos: currentPos };
  }

  /**
   * Execute a built-in function
   */
  private executeFunction(name: string, args: (number | string)[]): number | string {
    const upperName = name.toUpperCase();

    // Validate function name before executing
    const validFunctions = Object.values(FunctionName);
    if (!validFunctions.includes(upperName as FunctionNameType)) {
      throw new InvalidFunctionError(name);
    }

    switch (upperName as FunctionNameType) {
      case FunctionName.SUM:
        if (args.length === 0) {
          throw new FunctionArgumentError('SUM', 'requires at least one argument');
        }
        return args.reduce((sum: number, val) => sum + this.toNumber(val), 0);

      case FunctionName.AVERAGE:
      case FunctionName.AVG: {
        if (args.length === 0) {
          throw new FunctionArgumentError('AVERAGE', 'requires at least one argument');
        }
        const sum = args.reduce((s: number, val) => s + this.toNumber(val), 0);
        return sum / args.length;
      }

      case FunctionName.MIN:
        if (args.length === 0) {
          throw new FunctionArgumentError('MIN', 'requires at least one argument');
        }
        return Math.min(...args.map(v => this.toNumber(v)));

      case FunctionName.MAX:
        if (args.length === 0) {
          throw new FunctionArgumentError('MAX', 'requires at least one argument');
        }
        return Math.max(...args.map(v => this.toNumber(v)));

      case FunctionName.ADD:
        if (args.length !== 2) {
          throw new FunctionArgumentError('ADD', 'requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) + this.toNumber(args[1]);

      case FunctionName.SUB:
        if (args.length !== 2) {
          throw new FunctionArgumentError('SUB', 'requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) - this.toNumber(args[1]);

      case FunctionName.MUL:
      case FunctionName.MULTIPLY:
        if (args.length !== 2) {
          throw new FunctionArgumentError('MUL', 'requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) * this.toNumber(args[1]);

      case FunctionName.DIV:
      case FunctionName.DIVIDE: {
        if (args.length !== 2) {
          throw new FunctionArgumentError('DIV', 'requires exactly 2 arguments');
        }
        const divisor = this.toNumber(args[1]);
        if (divisor === 0) {
          throw new DivisionByZeroError();
        }
        return this.toNumber(args[0]) / divisor;
      }

      // Logical functions
      case FunctionName.IF: {
        if (args.length !== 3) {
          throw new FunctionArgumentError('IF', 'requires exactly 3 arguments');
        }
        const condition = this.toBoolean(args[0]);
        return condition ? args[1] : args[2];
      }

      // Count functions
      case FunctionName.COUNT: {
        if (args.length === 0) {
          throw new FunctionArgumentError('COUNT', 'requires at least one argument');
        }
        return args.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
      }

      // String functions
      case FunctionName.CONCATENATE:
      case FunctionName.CONCAT: {
        if (args.length === 0) {
          throw new FunctionArgumentError('CONCATENATE', 'requires at least one argument');
        }
        return args.map(String).join('');
      }

      case FunctionName.LEFT: {
        if (args.length !== 2) {
          throw new FunctionArgumentError('LEFT', 'requires exactly 2 arguments');
        }
        const text = String(args[0]);
        const numChars = this.toNumber(args[1]);
        return text.substring(0, numChars);
      }

      case FunctionName.RIGHT: {
        if (args.length !== 2) {
          throw new FunctionArgumentError('RIGHT', 'requires exactly 2 arguments');
        }
        const text = String(args[0]);
        const numChars = this.toNumber(args[1]);
        return text.substring(text.length - numChars);
      }

      case FunctionName.TRIM: {
        if (args.length !== 1) {
          throw new FunctionArgumentError('TRIM', 'requires exactly 1 argument');
        }
        return String(args[0]).trim();
      }

      case FunctionName.UPPER: {
        if (args.length !== 1) {
          throw new FunctionArgumentError('UPPER', 'requires exactly 1 argument');
        }
        return String(args[0]).toUpperCase();
      }

      case FunctionName.LOWER: {
        if (args.length !== 1) {
          throw new FunctionArgumentError('LOWER', 'requires exactly 1 argument');
        }
        return String(args[0]).toLowerCase();
      }

      // Date/time functions
      case FunctionName.NOW: {
        if (args.length !== 0) {
          throw new FunctionArgumentError('NOW', 'requires no arguments');
        }
        return Date.now();
      }

      case FunctionName.TODAY: {
        if (args.length !== 0) {
          throw new FunctionArgumentError('TODAY', 'requires no arguments');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime();
      }

      case FunctionName.DATE: {
        if (args.length !== 3) {
          throw new FunctionArgumentError(
            'DATE',
            'requires exactly 3 arguments (year, month, day)'
          );
        }
        const year = this.toNumber(args[0]);
        const month = this.toNumber(args[1]);
        const day = this.toNumber(args[2]);
        return new Date(year, month - 1, day).getTime();
      }

      case FunctionName.DATEDIF: {
        if (args.length !== 3) {
          throw new FunctionArgumentError(
            'DATEDIF',
            'requires exactly 3 arguments (start, end, unit)'
          );
        }
        const start = this.toNumber(args[0]);
        const end = this.toNumber(args[1]);
        const unit = String(args[2]).toUpperCase();

        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();

        switch (unit) {
          case 'D': // Days
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
          case 'M': // Months
            return (
              (endDate.getFullYear() - startDate.getFullYear()) * 12 +
              (endDate.getMonth() - startDate.getMonth())
            );
          case 'Y': // Years
            return endDate.getFullYear() - startDate.getFullYear();
          default:
            throw new FunctionArgumentError('DATEDIF', `Invalid unit: ${unit}. Use D, M, or Y.`);
        }
      }

      default:
        throw new InvalidFunctionError(name);
    }
  }

  /**
   * Convert a value to a number
   */
  private toNumber(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }
    const num = parseFloat(String(value));
    if (isNaN(num)) {
      throw new FormulaParseError(`Cannot convert '${value}' to number`);
    }
    return num;
  }

  /**
   * Convert a value to a boolean
   */
  private toBoolean(value: number | string): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    const str = String(value).toLowerCase();
    if (str === 'true' || str === '1') {
      return true;
    }
    if (str === 'false' || str === '0' || str === '') {
      return false;
    }
    // Non-empty strings are truthy
    return str.length > 0;
  }
}
