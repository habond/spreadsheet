import { describe, it, expect } from 'vitest';
import { extractCellReferences } from '../formula-parser';
import { tokenize } from '../tokenizer';

describe('FormulaParser', () => {
  describe('extractCellReferences', () => {
    it('should extract single cell reference', () => {
      const refs = extractCellReferences('A1');
      expect(refs).toEqual(new Set(['A1']));
    });

    it('should extract multiple cell references', () => {
      const refs = extractCellReferences('A1 + B2 + C3');
      expect(refs).toEqual(new Set(['A1', 'B2', 'C3']));
    });

    it('should extract cell references from function calls', () => {
      const refs = extractCellReferences('SUM(A1, B2, C3)');
      expect(refs).toEqual(new Set(['A1', 'B2', 'C3']));
    });

    it('should handle double-letter columns', () => {
      const refs = extractCellReferences('AA10 + AB20');
      expect(refs).toEqual(new Set(['AA10', 'AB20']));
    });

    it('should return empty set for formulas without cell references', () => {
      const refs = extractCellReferences('5 + 10');
      expect(refs.size).toBe(0);
    });

    it('should handle complex formulas', () => {
      const refs = extractCellReferences('SUM(A1, B2) + AVG(C3, D4) * E5');
      expect(refs).toEqual(new Set(['A1', 'B2', 'C3', 'D4', 'E5']));
    });
  });

  describe('tokenize', () => {
    it('should tokenize a simple number', () => {
      const tokens = tokenize('42');
      expect(tokens).toEqual([{ type: 'NUMBER', value: '42' }]);
    });

    it('should tokenize decimal numbers', () => {
      const tokens = tokenize('3.14');
      expect(tokens).toEqual([{ type: 'NUMBER', value: '3.14' }]);
    });

    it('should tokenize addition expression', () => {
      const tokens = tokenize('5 + 3');
      expect(tokens).toEqual([
        { type: 'NUMBER', value: '5' },
        { type: 'OPERATOR', value: '+' },
        { type: 'NUMBER', value: '3' },
      ]);
    });

    it('should tokenize all operators', () => {
      const tokens = tokenize('1 + 2 - 3 * 4 / 5');
      expect(tokens).toEqual([
        { type: 'NUMBER', value: '1' },
        { type: 'OPERATOR', value: '+' },
        { type: 'NUMBER', value: '2' },
        { type: 'OPERATOR', value: '-' },
        { type: 'NUMBER', value: '3' },
        { type: 'OPERATOR', value: '*' },
        { type: 'NUMBER', value: '4' },
        { type: 'OPERATOR', value: '/' },
        { type: 'NUMBER', value: '5' },
      ]);
    });

    it('should tokenize cell references', () => {
      const tokens = tokenize('A1 + B2');
      expect(tokens).toEqual([
        { type: 'CELL_REF', value: 'A1' },
        { type: 'OPERATOR', value: '+' },
        { type: 'CELL_REF', value: 'B2' },
      ]);
    });

    it('should tokenize function calls', () => {
      const tokens = tokenize('SUM(A1, B2)');
      expect(tokens).toEqual([
        { type: 'FUNCTION', value: 'SUM' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'A1' },
        { type: 'COMMA', value: ',' },
        { type: 'CELL_REF', value: 'B2' },
        { type: 'RPAREN', value: ')' },
      ]);
    });

    it('should tokenize nested function calls', () => {
      const tokens = tokenize('SUM(A1, AVG(B2, C3))');
      expect(tokens).toEqual([
        { type: 'FUNCTION', value: 'SUM' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'A1' },
        { type: 'COMMA', value: ',' },
        { type: 'FUNCTION', value: 'AVG' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'B2' },
        { type: 'COMMA', value: ',' },
        { type: 'CELL_REF', value: 'C3' },
        { type: 'RPAREN', value: ')' },
        { type: 'RPAREN', value: ')' },
      ]);
    });

    it('should tokenize expressions with parentheses', () => {
      const tokens = tokenize('(5 + 3) * 2');
      expect(tokens).toEqual([
        { type: 'LPAREN', value: '(' },
        { type: 'NUMBER', value: '5' },
        { type: 'OPERATOR', value: '+' },
        { type: 'NUMBER', value: '3' },
        { type: 'RPAREN', value: ')' },
        { type: 'OPERATOR', value: '*' },
        { type: 'NUMBER', value: '2' },
      ]);
    });

    it('should skip whitespace', () => {
      const tokens = tokenize('  5   +   3  ');
      expect(tokens).toEqual([
        { type: 'NUMBER', value: '5' },
        { type: 'OPERATOR', value: '+' },
        { type: 'NUMBER', value: '3' },
      ]);
    });

    it('should handle double-letter cell references', () => {
      const tokens = tokenize('AA10 + AB20');
      expect(tokens).toEqual([
        { type: 'CELL_REF', value: 'AA10' },
        { type: 'OPERATOR', value: '+' },
        { type: 'CELL_REF', value: 'AB20' },
      ]);
    });

    it('should throw error on invalid character', () => {
      expect(() => tokenize('5 @ 3')).toThrow('Unexpected character: @');
    });

    it('should throw error on invalid identifier', () => {
      expect(() => tokenize('ABC')).toThrow('Invalid identifier: ABC');
    });

    it('should tokenize complex formulas', () => {
      const tokens = tokenize('SUM(A1, B2) + (C3 * 2)');
      expect(tokens).toEqual([
        { type: 'FUNCTION', value: 'SUM' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'A1' },
        { type: 'COMMA', value: ',' },
        { type: 'CELL_REF', value: 'B2' },
        { type: 'RPAREN', value: ')' },
        { type: 'OPERATOR', value: '+' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'C3' },
        { type: 'OPERATOR', value: '*' },
        { type: 'NUMBER', value: '2' },
        { type: 'RPAREN', value: ')' },
      ]);
    });

    it('should tokenize string literals', () => {
      const tokens = tokenize('"hello"');
      expect(tokens).toEqual([{ type: 'STRING', value: 'hello' }]);
    });

    it('should tokenize string literals with spaces', () => {
      const tokens = tokenize('"hello world"');
      expect(tokens).toEqual([{ type: 'STRING', value: 'hello world' }]);
    });

    it('should tokenize CONCATENATE with strings', () => {
      const tokens = tokenize('CONCATENATE("Hello", " ", "World")');
      expect(tokens).toEqual([
        { type: 'FUNCTION', value: 'CONCATENATE' },
        { type: 'LPAREN', value: '(' },
        { type: 'STRING', value: 'Hello' },
        { type: 'COMMA', value: ',' },
        { type: 'STRING', value: ' ' },
        { type: 'COMMA', value: ',' },
        { type: 'STRING', value: 'World' },
        { type: 'RPAREN', value: ')' },
      ]);
    });

    it('should throw error on unterminated string', () => {
      expect(() => tokenize('"hello')).toThrow('Unterminated string literal');
    });

    it('should tokenize comparison operators', () => {
      const tokens = tokenize('5 > 3');
      expect(tokens).toEqual([
        { type: 'NUMBER', value: '5' },
        { type: 'COMPARISON', value: '>' },
        { type: 'NUMBER', value: '3' },
      ]);
    });

    it('should tokenize all comparison operators', () => {
      const tokens = tokenize('A1 < B1');
      expect(tokens[1]).toEqual({ type: 'COMPARISON', value: '<' });
    });

    it('should tokenize two-character comparison operators', () => {
      const tokens1 = tokenize('5 >= 3');
      expect(tokens1[1]).toEqual({ type: 'COMPARISON', value: '>=' });

      const tokens2 = tokenize('5 <= 3');
      expect(tokens2[1]).toEqual({ type: 'COMPARISON', value: '<=' });

      const tokens3 = tokenize('5 <> 3');
      expect(tokens3[1]).toEqual({ type: 'COMPARISON', value: '<>' });

      const tokens4 = tokenize('5 = 3');
      expect(tokens4[1]).toEqual({ type: 'COMPARISON', value: '=' });
    });

    it('should normalize == to =', () => {
      const tokens = tokenize('5 == 3');
      expect(tokens[1]).toEqual({ type: 'COMPARISON', value: '=' });
    });

    it('should normalize != to <>', () => {
      const tokens = tokenize('5 != 3');
      expect(tokens[1]).toEqual({ type: 'COMPARISON', value: '<>' });
    });

    it('should tokenize IF with comparison', () => {
      const tokens = tokenize('IF(A1 > 5, "High", "Low")');
      expect(tokens).toEqual([
        { type: 'FUNCTION', value: 'IF' },
        { type: 'LPAREN', value: '(' },
        { type: 'CELL_REF', value: 'A1' },
        { type: 'COMPARISON', value: '>' },
        { type: 'NUMBER', value: '5' },
        { type: 'COMMA', value: ',' },
        { type: 'STRING', value: 'High' },
        { type: 'COMMA', value: ',' },
        { type: 'STRING', value: 'Low' },
        { type: 'RPAREN', value: ')' },
      ]);
    });
  });
});
