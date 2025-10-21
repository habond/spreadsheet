import { FormulaParseError } from '../errors/FormulaParseError';

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'CELL_REF'
  | 'RANGE'
  | 'FUNCTION'
  | 'OPERATOR'
  | 'COMPARISON'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'COLON';

export interface Token {
  type: TokenType;
  value: string;
}

// Match cell references like A1, B2, AA10, etc.
const CELL_REF_PATTERN = /\b[A-Z]+[0-9]+\b/g;

/**
 * Tokenize a formula string into an array of tokens
 */
export function tokenize(formula: string): Token[] {
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
        throw new FormulaParseError('Unterminated string literal');
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

    // Cell references, ranges, or functions
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
        // Check if it's followed by a colon (range)
        if (i < formula.length && formula[i] === ':') {
          // Start of a range - consume the colon and the end cell
          const rangeStart = ident;
          i++; // Skip the colon

          // Parse the end cell
          let endCell = '';
          while (i < formula.length && /[A-Z0-9]/.test(formula[i])) {
            endCell += formula[i];
            i++;
          }

          if (!new RegExp(CELL_REF_PATTERN.source).test(endCell)) {
            throw new FormulaParseError(`Invalid range end: ${endCell}`);
          }

          tokens.push({ type: 'RANGE', value: `${rangeStart}:${endCell}` });
        } else {
          // It's a cell reference
          tokens.push({ type: 'CELL_REF', value: ident });
        }
      } else {
        throw new FormulaParseError(`Invalid identifier: ${ident}`);
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

    throw new FormulaParseError(`Unexpected character: ${char}`);
  }

  return tokens;
}
