import { FormulaParseError } from '../errors/FormulaParseError';
import { expandRange } from './helpers';
import type { Token, TokenType } from './tokenizer';
import {
  ASTNode,
  NumberNode,
  StringNode,
  CellRefNode,
  RangeNode,
  BinaryOpNode,
  UnaryOpNode,
  FunctionCallNode,
} from '../types/ast';

/**
 * Parser class that builds an AST from a token stream.
 * Implements a recursive descent parser with proper operator precedence.
 */
export class ASTParser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parse the token stream into an AST
   */
  parse(): ASTNode {
    const ast = this.parseComparison();

    // Ensure all tokens were consumed
    if (this.pos < this.tokens.length) {
      throw new FormulaParseError(`Unexpected token at position ${this.pos}: ${this.current()?.value}`);
    }

    return ast;
  }

  private current(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.current();
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new FormulaParseError(
        `Expected ${type}${value ? ` '${value}'` : ''}, got ${token ? token.type + ' ' + token.value : 'end of input'}`
      );
    }
    return this.advance();
  }

  /**
   * Parse comparison: expression (COMPARISON expression)*
   */
  private parseComparison(): ASTNode {
    let left = this.parseExpression();

    while (this.current()?.type === 'COMPARISON') {
      const operator = this.advance().value;
      const right = this.parseExpression();
      left = {
        type: 'BinaryOp',
        operator,
        left,
        right,
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse expression: term ((+|-) term)*
   */
  private parseExpression(): ASTNode {
    let left = this.parseTerm();

    while (this.current()?.type === 'OPERATOR' && ['+', '-'].includes(this.current()!.value)) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      left = {
        type: 'BinaryOp',
        operator,
        left,
        right,
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse term: factor ((*|/) factor)*
   */
  private parseTerm(): ASTNode {
    let left = this.parseFactor();

    while (this.current()?.type === 'OPERATOR' && ['*', '/'].includes(this.current()!.value)) {
      const operator = this.advance().value;
      const right = this.parseFactor();
      left = {
        type: 'BinaryOp',
        operator,
        left,
        right,
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse factor: NUMBER | STRING | CELL_REF | RANGE | FUNCTION | (expression) | -factor
   */
  private parseFactor(): ASTNode {
    const token = this.current();

    if (!token) {
      throw new FormulaParseError('Unexpected end of input');
    }

    // Handle unary minus
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.advance();
      const operand = this.parseFactor();
      return {
        type: 'UnaryOp',
        operator: '-',
        operand,
      } as UnaryOpNode;
    }

    // Handle parenthesized expressions
    if (token.type === 'LPAREN') {
      this.advance();
      const expr = this.parseComparison();
      this.expect('RPAREN');
      return expr;
    }

    // Handle numbers
    if (token.type === 'NUMBER') {
      this.advance();
      return {
        type: 'Number',
        value: parseFloat(token.value),
      } as NumberNode;
    }

    // Handle strings
    if (token.type === 'STRING') {
      this.advance();
      return {
        type: 'String',
        value: token.value,
      } as StringNode;
    }

    // Handle cell references
    if (token.type === 'CELL_REF') {
      this.advance();
      return {
        type: 'CellRef',
        cellId: token.value,
      } as CellRefNode;
    }

    // Handle ranges
    if (token.type === 'RANGE') {
      this.advance();
      return {
        type: 'Range',
        cells: expandRange(token.value),
      } as RangeNode;
    }

    // Handle function calls
    if (token.type === 'FUNCTION') {
      const name = this.advance().value;
      this.expect('LPAREN');

      const args: ASTNode[] = [];

      // Parse function arguments
      if (this.current()?.type !== 'RPAREN') {
        args.push(this.parseComparison());
        while (this.current()?.type === 'COMMA') {
          this.advance(); // consume comma
          args.push(this.parseComparison());
        }
      }

      this.expect('RPAREN');

      return {
        type: 'FunctionCall',
        name,
        args,
      } as FunctionCallNode;
    }

    throw new FormulaParseError(`Unexpected token: ${token.type} ${token.value}`);
  }
}
