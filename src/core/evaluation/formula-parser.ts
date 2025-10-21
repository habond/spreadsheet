import { CellID } from '../types';

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'CELL_REF'
  | 'FUNCTION'
  | 'OPERATOR'
  | 'COMPARISON'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA';

export interface Token {
  type: TokenType;
  value: string;
}

// Match cell references like A1, B2, AA10, etc.
const CELL_REF_PATTERN = /\b[A-Z]+[0-9]+\b/g;

export class FormulaParser {
  /**
   * Extract all cell references from a formula
   */
  static extractCellReferences(formula: string): Set<CellID> {
    const refs = new Set<CellID>();
    const matches = formula.match(CELL_REF_PATTERN);
    if (matches) {
      matches.forEach(ref => refs.add(ref));
    }
    return refs;
  }

  /**
   * Tokenize a formula string
   */
  static tokenize(formula: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < formula.length) {
      const char = formula[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // String literals (double quotes)
      if (char === '"') {
        let str = '';
        i++; // Skip opening quote
        while (i < formula.length && formula[i] !== '"') {
          str += formula[i];
          i++;
        }
        if (i >= formula.length) {
          throw new Error('Unterminated string literal');
        }
        i++; // Skip closing quote
        tokens.push({ type: 'STRING', value: str });
        continue;
      }

      // Numbers (including decimals)
      if (/\d/.test(char)) {
        let num = '';
        while (i < formula.length && /[\d.]/.test(formula[i])) {
          num += formula[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      // Cell references or functions
      if (/[A-Z]/.test(char)) {
        let ident = '';
        while (i < formula.length && /[A-Z0-9]/.test(formula[i])) {
          ident += formula[i];
          i++;
        }

        // Check if it's followed by a parenthesis (function call)
        if (i < formula.length && formula[i] === '(') {
          tokens.push({ type: 'FUNCTION', value: ident });
        } else if (new RegExp(CELL_REF_PATTERN.source).test(ident)) {
          // It's a cell reference
          tokens.push({ type: 'CELL_REF', value: ident });
        } else {
          throw new Error(`Invalid identifier: ${ident}`);
        }
        continue;
      }

      // Comparison operators (need to check two-character operators first)
      if (char === '>' || char === '<' || char === '=' || char === '!') {
        let op = char;
        // Check for two-character operators: >=, <=, ==, !=, <>
        if (i + 1 < formula.length) {
          const nextChar = formula[i + 1];
          if (
            (char === '>' && nextChar === '=') ||
            (char === '<' && (nextChar === '=' || nextChar === '>')) ||
            (char === '=' && nextChar === '=') ||
            (char === '!' && nextChar === '=')
          ) {
            op += nextChar;
            i++;
          }
        }
        // Normalize == to = and != or <> to <>
        if (op === '==') op = '=';
        if (op === '!=') op = '<>';
        tokens.push({ type: 'COMPARISON', value: op });
        i++;
        continue;
      }

      // Arithmetic operators
      if (['+', '-', '*', '/'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // Parentheses
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: char });
        i++;
        continue;
      }

      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: char });
        i++;
        continue;
      }

      // Comma
      if (char === ',') {
        tokens.push({ type: 'COMMA', value: char });
        i++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    return tokens;
  }
}
