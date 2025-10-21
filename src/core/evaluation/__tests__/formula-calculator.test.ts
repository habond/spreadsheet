import { describe, it, expect, beforeEach } from 'vitest';
import { FormulaCalculator } from '../formula-calculator';
import { EvalResult, GetCellResultFn } from '../../types';

describe('FormulaCalculator', () => {
  let calculator: FormulaCalculator;
  let cellResults: Map<string, EvalResult>;

  beforeEach(() => {
    cellResults = new Map();
    const getCellResult: GetCellResultFn = cellId => cellResults.get(cellId);
    calculator = new FormulaCalculator(getCellResult);
  });

  describe('basic arithmetic', () => {
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
  });

  describe('SUM function', () => {
    it('should sum multiple numbers', () => {
      const result = calculator.calculate('SUM(1, 2, 3, 4)');
      expect(result).toEqual({ value: 10, error: null });
    });

    it('should sum cell references', () => {
      cellResults.set('A1', { value: 5, error: null });
      cellResults.set('A2', { value: 10, error: null });
      cellResults.set('A3', { value: 15, error: null });

      const result = calculator.calculate('SUM(A1, A2, A3)');
      expect(result).toEqual({ value: 30, error: null });
    });

    it('should sum mixed values', () => {
      cellResults.set('A1', { value: 5, error: null });

      const result = calculator.calculate('SUM(A1, 10, 15)');
      expect(result).toEqual({ value: 30, error: null });
    });

    it('should require at least one argument', () => {
      const result = calculator.calculate('SUM()');
      expect(result.error).toContain('SUM requires at least one argument');
    });
  });

  describe('AVERAGE function', () => {
    it('should calculate average of numbers', () => {
      const result = calculator.calculate('AVERAGE(10, 20, 30)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should work with AVG alias', () => {
      const result = calculator.calculate('AVG(10, 20, 30)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should calculate average of cell references', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('AVERAGE(A1, A2)');
      expect(result).toEqual({ value: 15, error: null });
    });

    it('should require at least one argument', () => {
      const result = calculator.calculate('AVERAGE()');
      expect(result.error).toContain('AVERAGE requires at least one argument');
    });
  });

  describe('MIN function', () => {
    it('should find minimum value', () => {
      const result = calculator.calculate('MIN(5, 2, 8, 1, 9)');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should work with cell references', () => {
      cellResults.set('A1', { value: 15, error: null });
      cellResults.set('A2', { value: 5, error: null });
      cellResults.set('A3', { value: 10, error: null });

      const result = calculator.calculate('MIN(A1, A2, A3)');
      expect(result).toEqual({ value: 5, error: null });
    });

    it('should require at least one argument', () => {
      const result = calculator.calculate('MIN()');
      expect(result.error).toContain('MIN requires at least one argument');
    });
  });

  describe('MAX function', () => {
    it('should find maximum value', () => {
      const result = calculator.calculate('MAX(5, 2, 8, 1, 9)');
      expect(result).toEqual({ value: 9, error: null });
    });

    it('should work with cell references', () => {
      cellResults.set('A1', { value: 15, error: null });
      cellResults.set('A2', { value: 5, error: null });
      cellResults.set('A3', { value: 10, error: null });

      const result = calculator.calculate('MAX(A1, A2, A3)');
      expect(result).toEqual({ value: 15, error: null });
    });

    it('should require at least one argument', () => {
      const result = calculator.calculate('MAX()');
      expect(result.error).toContain('MAX requires at least one argument');
    });
  });

  describe('binary functions', () => {
    it('should handle ADD function', () => {
      const result = calculator.calculate('ADD(5, 3)');
      expect(result).toEqual({ value: 8, error: null });
    });

    it('should handle SUB function', () => {
      const result = calculator.calculate('SUB(10, 3)');
      expect(result).toEqual({ value: 7, error: null });
    });

    it('should handle MUL function', () => {
      const result = calculator.calculate('MUL(4, 5)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should handle MULTIPLY alias', () => {
      const result = calculator.calculate('MULTIPLY(4, 5)');
      expect(result).toEqual({ value: 20, error: null });
    });

    it('should handle DIV function', () => {
      const result = calculator.calculate('DIV(20, 4)');
      expect(result).toEqual({ value: 5, error: null });
    });

    it('should handle DIVIDE alias', () => {
      const result = calculator.calculate('DIVIDE(20, 4)');
      expect(result).toEqual({ value: 5, error: null });
    });

    it('should require exactly 2 arguments for ADD', () => {
      const result = calculator.calculate('ADD(1, 2, 3)');
      expect(result.error).toContain('ADD requires exactly 2 arguments');
    });

    it('should handle division by zero in DIV function', () => {
      const result = calculator.calculate('DIV(10, 0)');
      expect(result.error).toBe('Division by zero');
    });
  });

  describe('nested functions', () => {
    it('should handle nested function calls', () => {
      const result = calculator.calculate('SUM(1, AVG(2, 4), 3)');
      expect(result).toEqual({ value: 7, error: null });
    });

    it('should handle complex nested expressions', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });

      const result = calculator.calculate('SUM(A1, MUL(A2, 2))');
      expect(result).toEqual({ value: 50, error: null });
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
      expect(result.error).toContain('Missing closing parenthesis');
    });

    it('should handle non-numeric values', () => {
      cellResults.set('A1', { value: 'text', error: null });

      const result = calculator.calculate('A1 + 5');
      expect(result.error).toContain('Cannot convert');
    });
  });

  describe('complex formulas', () => {
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
  });
});
