import { describe, it, expect, beforeEach } from 'vitest';
import type { EvalResult, GetCellResultFn } from '../../types/core';
import { FormulaCalculator } from '../formula-evaluator';

describe('FormulaCalculator', () => {
  let calculator: FormulaCalculator;
  let cellResults: Map<string, EvalResult>;

  beforeEach(() => {
    cellResults = new Map();
    const getCellResult: GetCellResultFn = cellId => cellResults.get(cellId);
    calculator = new FormulaCalculator(getCellResult);
  });

  describe('basic arithmetic operators', () => {
    it('should calculate addition', () => {
      const result = calculator.calculate('5 + 3');
      expect(result).toEqual({ value: 8, error: null });
    });

    it('should calculate subtraction', () => {
      const result = calculator.calculate('10 - 3');
      expect(result).toEqual({ value: 7, error: null });
    });

    it('should calculate multiplication', () => {
      const result = calculator.calculate('4 * 5');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should calculate division', () => {
      const result = calculator.calculate('20 / 4');
      expect(result).toEqual({ value: 5, error: null });
    });

    it('should handle decimal numbers', () => {
      const result = calculator.calculate('3.5 + 2.5');
      expect(result).toEqual({ value: 6, error: null });
    });

    it('should handle division by zero', () => {
      const result = calculator.calculate('10 / 0');
      expect(result.error).toBe('Division by zero');
      expect(result.value).toBeNull();
    });

    it('should handle negative numbers', () => {
      const result = calculator.calculate('-5 + 3');
      expect(result).toEqual({ value: -2, error: null });
    });
  });

  describe('operator precedence', () => {
    it('should respect multiplication before addition', () => {
      const result = calculator.calculate('2 + 3 * 4');
      expect(result).toEqual({ value: 14, error: null });
    });

    it('should respect division before subtraction', () => {
      const result = calculator.calculate('10 - 6 / 2');
      expect(result).toEqual({ value: 7, error: null });
    });

    it('should handle parentheses', () => {
      const result = calculator.calculate('(2 + 3) * 4');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should handle nested parentheses', () => {
      const result = calculator.calculate('((2 + 3) * 4) - 5');
      expect(result).toEqual({ value: 15, error: null });
    });

    it('should handle complex expressions', () => {
      const result = calculator.calculate('2 + 3 * 4 - 6 / 2');
      expect(result).toEqual({ value: 11, error: null });
    });
  });

  describe('comparison operators', () => {
    it('should handle equals (=)', () => {
      expect(calculator.calculate('5 = 5')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('5 = 3')).toEqual({ value: 0, error: null });
    });

    it('should handle == as alias for =', () => {
      expect(calculator.calculate('5 == 5')).toEqual({ value: 1, error: null });
    });

    it('should handle not equals (<>)', () => {
      expect(calculator.calculate('5 <> 3')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('5 <> 5')).toEqual({ value: 0, error: null });
    });

    it('should handle != as alias for <>', () => {
      expect(calculator.calculate('5 != 3')).toEqual({ value: 1, error: null });
    });

    it('should handle less than (<)', () => {
      expect(calculator.calculate('3 < 5')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('5 < 3')).toEqual({ value: 0, error: null });
    });

    it('should handle greater than (>)', () => {
      expect(calculator.calculate('5 > 3')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('3 > 5')).toEqual({ value: 0, error: null });
    });

    it('should handle less than or equal (<=)', () => {
      expect(calculator.calculate('3 <= 5')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('5 <= 5')).toEqual({ value: 1, error: null });
    });

    it('should handle greater than or equal (>=)', () => {
      expect(calculator.calculate('5 >= 3')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('5 >= 5')).toEqual({ value: 1, error: null });
    });

    it('should handle string equality', () => {
      expect(calculator.calculate('"hello" = "hello"')).toEqual({ value: 1, error: null });
      expect(calculator.calculate('"hello" = "world"')).toEqual({ value: 0, error: null });
    });

    it('should handle comparisons with expressions', () => {
      const result = calculator.calculate('(2 + 3) > 4');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle comparisons with cell references', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 5, error: null });

      const result = calculator.calculate('A1 > A2');
      expect(result).toEqual({ value: 1, error: null });
    });
  });

  describe('cell references', () => {
    it('should resolve cell references', () => {
      cellResults.set('A1', { value: 5, error: null });
      cellResults.set('B1', { value: 3, error: null });

      const result = calculator.calculate('A1 + B1');
      expect(result).toEqual({ value: 8, error: null });
    });

    it('should handle cell reference errors', () => {
      cellResults.set('A1', { value: null, error: 'Some error' });

      const result = calculator.calculate('A1 + 5');
      expect(result.error).toContain('Cell A1 has error');
      expect(result.value).toBeNull();
    });

    it('should handle missing cell references', () => {
      const result = calculator.calculate('A1 + 5');
      expect(result.error).toContain('Cell A1 has no value');
      expect(result.value).toBeNull();
    });

    it('should handle multiple cell references', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('B1', { value: 5, error: null });
      cellResults.set('C1', { value: 2, error: null });

      const result = calculator.calculate('A1 - B1 * C1');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should handle cell references in comparisons', () => {
      cellResults.set('A1', { value: 10, error: null });
      const result = calculator.calculate('A1 > 5');
      expect(result).toEqual({ value: 1, error: null });
    });
  });

  describe('string literals', () => {
    it('should handle double-quoted strings', () => {
      const result = calculator.calculate('"hello"');
      expect(result).toEqual({ value: 'hello', error: null });
    });

    it('should handle strings with spaces', () => {
      const result = calculator.calculate('"Hello World"');
      expect(result).toEqual({ value: 'Hello World', error: null });
    });

    it('should handle empty strings', () => {
      const result = calculator.calculate('""');
      expect(result).toEqual({ value: '', error: null });
    });
  });

  describe('error handling', () => {
    it('should handle unknown functions', () => {
      const result = calculator.calculate('UNKNOWN(1, 2)');
      expect(result.error).toContain('Unknown function: UNKNOWN');
    });

    it('should handle invalid syntax', () => {
      const result = calculator.calculate('5 +');
      expect(result.error).toBeTruthy();
      expect(result.value).toBeNull();
    });

    it('should handle missing closing parenthesis', () => {
      const result = calculator.calculate('(5 + 3');
      expect(result.error).toContain('Expected RPAREN');
    });

    it('should handle non-numeric values in arithmetic', () => {
      cellResults.set('A1', { value: 'text', error: null });

      const result = calculator.calculate('A1 + 5');
      expect(result.error).toContain('Cannot convert');
    });

    it('should handle invalid cell reference format', () => {
      const result = calculator.calculate('XYZ123 + 5');
      expect(result.error).toBeTruthy();
    });
  });

  describe('function integration (basic smoke tests)', () => {
    it('should call SUM function', () => {
      const result = calculator.calculate('SUM(1, 2, 3)');
      expect(result).toEqual({ value: 6, error: null });
    });

    it('should call AVERAGE function', () => {
      const result = calculator.calculate('AVERAGE(10, 20, 30)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should call IF function', () => {
      const result = calculator.calculate('IF(1, "yes", "no")');
      expect(result).toEqual({ value: 'yes', error: null });
    });

    it('should call CONCATENATE function', () => {
      const result = calculator.calculate('CONCATENATE("Hello", " ", "World")');
      expect(result).toEqual({ value: 'Hello World', error: null });
    });

    it('should handle nested function calls', () => {
      const result = calculator.calculate('SUM(1, AVG(2, 4), 3)');
      expect(result).toEqual({ value: 7, error: null });
    });

    it('should handle functions with cell references', () => {
      cellResults.set('A1', { value: 5, error: null });
      cellResults.set('A2', { value: 10, error: null });

      const result = calculator.calculate('SUM(A1, A2)');
      expect(result).toEqual({ value: 15, error: null });
    });

    it('should combine functions with operators', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('SUM(A1, A2) + 5');
      expect(result).toEqual({ value: 35, error: null });
    });

    it('should use comparison results in IF function', () => {
      cellResults.set('A1', { value: 10, error: null });
      const result = calculator.calculate('IF(A1 > 5, "High", "Low")');
      expect(result).toEqual({ value: 'High', error: null });
    });
  });

  describe('complex formula integration', () => {
    it('should handle complex multi-function formulas', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });
      cellResults.set('A3', { value: 30, error: null });

      const result = calculator.calculate('SUM(A1, A2) + AVG(A2, A3)');
      expect(result).toEqual({ value: 55, error: null });
    });

    it('should handle formulas with all operators and functions', () => {
      cellResults.set('A1', { value: 5, error: null });
      cellResults.set('A2', { value: 10, error: null });

      const result = calculator.calculate('(A1 + A2) * 2 - DIV(20, 2)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should handle nested IF with comparisons', () => {
      const result = calculator.calculate('IF(5 > 3, IF(2 < 1, "a", "b"), "c")');
      expect(result).toEqual({ value: 'b', error: null });
    });

    it('should handle DATE functions with DATEDIF', () => {
      const result = calculator.calculate('DATEDIF(DATE(2024, 1, 1), DATE(2024, 12, 31), "M")');
      expect(result).toEqual({ value: 11, error: null });
    });
  });

  describe('range evaluation edge cases', () => {
    it('should handle ranges with empty cells', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: null, error: null }); // Empty cell
      cellResults.set('A3', { value: 20, error: null });

      const result = calculator.calculate('SUM(A1:A3)');
      expect(result).toEqual({ value: 30, error: null }); // Should skip null
    });

    it('should handle ranges with error cells', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: null, error: 'Some error' }); // Error cell
      cellResults.set('A3', { value: 20, error: null });

      const result = calculator.calculate('SUM(A1:A3)');
      expect(result).toEqual({ value: 30, error: null }); // Should skip error cells
    });

    it('should throw error when using range in arithmetic expression', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('A1:A2 + 5');
      expect(result.error).toContain('Ranges cannot be used directly in expressions');
      expect(result.value).toBeNull();
    });

    it('should throw error when using range in comparison', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('A1:A2 > 5');
      expect(result.error).toContain('Ranges cannot be used directly in expressions');
      expect(result.value).toBeNull();
    });

    it('should throw error when using range in unary operation', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('-(A1:A2)');
      expect(result.error).toContain('Ranges cannot be used directly in expressions');
      expect(result.value).toBeNull();
    });
  });
});
