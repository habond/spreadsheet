import { FormulaParser, Token } from './formula-parser';
import { EvalResult, GetCellResultFn, FunctionInfo } from '../types';

type ParseResult = { value: number | string; nextPos: number };

/**
 * Function name constants for type safety
 */
export const FunctionName = {
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
} as const;

export type FunctionNameType = (typeof FunctionName)[keyof typeof FunctionName];

/**
 * Metadata for all supported spreadsheet functions
 */
export const SUPPORTED_FUNCTIONS: FunctionInfo[] = [
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
      const value = this.parseExpression(tokens, 0).value;
      return { value, error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
            throw new Error('Division by zero');
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
      throw new Error('Unexpected end of formula');
    }

    const token = tokens[pos];

    // Number literal
    if (token.type === 'NUMBER') {
      return { value: parseFloat(token.value), nextPos: pos + 1 };
    }

    // Cell reference
    if (token.type === 'CELL_REF') {
      const cellResult = this.getCellResult(token.value);
      if (!cellResult) {
        throw new Error(`Cell ${token.value} has no value`);
      }
      if (cellResult.error) {
        throw new Error(`Cell ${token.value} has error: ${cellResult.error}`);
      }
      if (cellResult.value === null) {
        throw new Error(`Cell ${token.value} has no value`);
      }
      return { value: cellResult.value, nextPos: pos + 1 };
    }

    // Function call
    if (token.type === 'FUNCTION') {
      return this.parseFunction(tokens, pos);
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      const result = this.parseExpression(tokens, pos + 1);
      if (result.nextPos >= tokens.length || tokens[result.nextPos].type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis');
      }
      return { value: result.value, nextPos: result.nextPos + 1 };
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  /**
   * Parse a function call
   */
  private parseFunction(tokens: Token[], pos: number): ParseResult {
    const funcToken = tokens[pos];
    const funcName = funcToken.value;

    // Expect opening parenthesis
    if (pos + 1 >= tokens.length || tokens[pos + 1].type !== 'LPAREN') {
      throw new Error(`Expected '(' after function ${funcName}`);
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
        const argResult = this.parseExpression(tokens, currentPos);
        args.push(argResult.value);
        currentPos = argResult.nextPos;

        if (currentPos >= tokens.length) {
          throw new Error(`Missing closing parenthesis for function ${funcName}`);
        }

        const nextToken = tokens[currentPos];
        if (nextToken.type === 'RPAREN') {
          currentPos++;
          break;
        } else if (nextToken.type === 'COMMA') {
          currentPos++;
          continue;
        } else {
          throw new Error(`Expected ',' or ')' in function ${funcName}`);
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
  private executeFunction(name: string, args: (number | string)[]): number {
    const upperName = name.toUpperCase();

    // Validate function name before executing
    const validFunctions = Object.values(FunctionName);
    if (!validFunctions.includes(upperName as FunctionNameType)) {
      throw new Error(`Unknown function: ${name}`);
    }

    switch (upperName as FunctionNameType) {
      case FunctionName.SUM:
        if (args.length === 0) {
          throw new Error('SUM requires at least one argument');
        }
        return args.reduce((sum: number, val) => sum + this.toNumber(val), 0);

      case FunctionName.AVERAGE:
      case FunctionName.AVG: {
        if (args.length === 0) {
          throw new Error('AVERAGE requires at least one argument');
        }
        const sum = args.reduce((s: number, val) => s + this.toNumber(val), 0);
        return sum / args.length;
      }

      case FunctionName.MIN:
        if (args.length === 0) {
          throw new Error('MIN requires at least one argument');
        }
        return Math.min(...args.map(v => this.toNumber(v)));

      case FunctionName.MAX:
        if (args.length === 0) {
          throw new Error('MAX requires at least one argument');
        }
        return Math.max(...args.map(v => this.toNumber(v)));

      case FunctionName.ADD:
        if (args.length !== 2) {
          throw new Error('ADD requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) + this.toNumber(args[1]);

      case FunctionName.SUB:
        if (args.length !== 2) {
          throw new Error('SUB requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) - this.toNumber(args[1]);

      case FunctionName.MUL:
      case FunctionName.MULTIPLY:
        if (args.length !== 2) {
          throw new Error('MUL requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) * this.toNumber(args[1]);

      case FunctionName.DIV:
      case FunctionName.DIVIDE: {
        if (args.length !== 2) {
          throw new Error('DIV requires exactly 2 arguments');
        }
        const divisor = this.toNumber(args[1]);
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        return this.toNumber(args[0]) / divisor;
      }
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
      throw new Error(`Cannot convert '${value}' to number`);
    }
    return num;
  }
}
