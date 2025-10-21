import { FormulaParser, Token } from './formula-parser';
import { EvalResult, GetCellResultFn } from '../types';

export class FormulaEvaluator {
  private getCellResult: GetCellResultFn;

  constructor(getCellResult: GetCellResultFn) {
    this.getCellResult = getCellResult;
  }

  /**
   * Evaluate a formula and return the result
   */
  evaluate(formula: string): EvalResult {
    try {
      const tokens = FormulaParser.tokenize(formula);
      const value = this.parseExpression(tokens, 0).value;
      return { value, error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse an expression (handles operators with precedence)
   */
  private parseExpression(tokens: Token[], pos: number): { value: any; nextPos: number } {
    // Parse first term
    let result = this.parseTerm(tokens, pos);

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
  private parseTerm(tokens: Token[], pos: number): { value: any; nextPos: number } {
    // Parse first factor
    let result = this.parseFactor(tokens, pos);

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
  private parseFactor(tokens: Token[], pos: number): { value: any; nextPos: number } {
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
  private parseFunction(tokens: Token[], pos: number): { value: any; nextPos: number } {
    const funcToken = tokens[pos];
    const funcName = funcToken.value;

    // Expect opening parenthesis
    if (pos + 1 >= tokens.length || tokens[pos + 1].type !== 'LPAREN') {
      throw new Error(`Expected '(' after function ${funcName}`);
    }

    // Parse arguments
    const args: any[] = [];
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
  private executeFunction(name: string, args: any[]): any {
    switch (name.toUpperCase()) {
      case 'SUM':
        if (args.length === 0) {
          throw new Error('SUM requires at least one argument');
        }
        return args.reduce((sum, val) => sum + this.toNumber(val), 0);

      case 'AVERAGE':
      case 'AVG':
        if (args.length === 0) {
          throw new Error('AVERAGE requires at least one argument');
        }
        const sum = args.reduce((s, val) => s + this.toNumber(val), 0);
        return sum / args.length;

      case 'MIN':
        if (args.length === 0) {
          throw new Error('MIN requires at least one argument');
        }
        return Math.min(...args.map(v => this.toNumber(v)));

      case 'MAX':
        if (args.length === 0) {
          throw new Error('MAX requires at least one argument');
        }
        return Math.max(...args.map(v => this.toNumber(v)));

      case 'ADD':
        if (args.length !== 2) {
          throw new Error('ADD requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) + this.toNumber(args[1]);

      case 'SUB':
        if (args.length !== 2) {
          throw new Error('SUB requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) - this.toNumber(args[1]);

      case 'MUL':
      case 'MULTIPLY':
        if (args.length !== 2) {
          throw new Error('MUL requires exactly 2 arguments');
        }
        return this.toNumber(args[0]) * this.toNumber(args[1]);

      case 'DIV':
      case 'DIVIDE':
        if (args.length !== 2) {
          throw new Error('DIV requires exactly 2 arguments');
        }
        const divisor = this.toNumber(args[1]);
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        return this.toNumber(args[0]) / divisor;

      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  /**
   * Convert a value to a number
   */
  private toNumber(value: any): number {
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
