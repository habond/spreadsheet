import { describe, it, expect, beforeEach } from 'vitest';
import { FormulaCalculator } from '../formula-evaluator';
import { EvalResult, GetCellResultFn } from '../../types/core';

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
      expect(result.error).toContain('requires at least one argument');
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
      expect(result.error).toContain('requires at least one argument');
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
      expect(result.error).toContain('requires at least one argument');
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
      expect(result.error).toContain('requires at least one argument');
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
      expect(result.error).toContain('requires exactly 2 arguments');
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
      expect(result.error).toContain('Expected RPAREN');
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

  describe('IF function', () => {
    it('should return value_if_true when condition is true', () => {
      const result = calculator.calculate('IF(1, "yes", "no")');
      expect(result).toEqual({ value: 'yes', error: null });
    });

    it('should return value_if_false when condition is false', () => {
      const result = calculator.calculate('IF(0, "yes", "no")');
      expect(result).toEqual({ value: 'no', error: null });
    });

    it('should handle numeric results', () => {
      const result = calculator.calculate('IF(1, 10, 20)');
      expect(result).toEqual({ value: 10, error: null });
    });

    it('should handle cell references in condition', () => {
      cellResults.set('A1', { value: 5, error: null });
      const result = calculator.calculate('IF(A1, "positive", "zero")');
      expect(result).toEqual({ value: 'positive', error: null });
    });

    it('should handle expressions in condition', () => {
      const result = calculator.calculate('IF(5 - 5, "yes", "no")');
      expect(result).toEqual({ value: 'no', error: null });
    });

    it('should require exactly 3 arguments', () => {
      const result = calculator.calculate('IF(1, "yes")');
      expect(result.error).toContain('requires exactly 3 arguments');
    });

    it('should handle nested IF', () => {
      const result = calculator.calculate('IF(1, IF(0, "a", "b"), "c")');
      expect(result).toEqual({ value: 'b', error: null });
    });
  });

  describe('COUNT function', () => {
    it('should count numeric values', () => {
      const result = calculator.calculate('COUNT(1, 2, 3, 4, 5)');
      expect(result).toEqual({ value: 5, error: null });
    });

    it('should count cell references with numeric values', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 20, error: null });
      cellResults.set('A3', { value: 'text', error: null });

      const result = calculator.calculate('COUNT(A1, A2, A3)');
      expect(result).toEqual({ value: 2, error: null });
    });

    it('should count numeric strings', () => {
      cellResults.set('A1', { value: '10', error: null });
      cellResults.set('A2', { value: '20', error: null });

      const result = calculator.calculate('COUNT(A1, A2)');
      expect(result).toEqual({ value: 2, error: null });
    });

    it('should require at least one argument', () => {
      const result = calculator.calculate('COUNT()');
      expect(result.error).toContain('requires at least one argument');
    });
  });

  describe('string functions', () => {
    describe('CONCATENATE/CONCAT', () => {
      it('should concatenate string literals', () => {
        const result = calculator.calculate('CONCATENATE("Hello", " ", "World")');
        expect(result).toEqual({ value: 'Hello World', error: null });
      });

      it('should work with CONCAT alias', () => {
        const result = calculator.calculate('CONCAT("foo", "bar")');
        expect(result).toEqual({ value: 'foobar', error: null });
      });

      it('should concatenate numbers as strings', () => {
        const result = calculator.calculate('CONCATENATE(1, 2, 3)');
        expect(result).toEqual({ value: '123', error: null });
      });

      it('should concatenate cell references', () => {
        cellResults.set('A1', { value: 'Hello', error: null });
        cellResults.set('A2', { value: 'World', error: null });

        const result = calculator.calculate('CONCATENATE(A1, " ", A2)');
        expect(result).toEqual({ value: 'Hello World', error: null });
      });

      it('should require at least one argument', () => {
        const result = calculator.calculate('CONCATENATE()');
        expect(result.error).toContain('requires at least one argument');
      });
    });

    describe('LEFT', () => {
      it('should extract characters from left', () => {
        const result = calculator.calculate('LEFT("Hello", 3)');
        expect(result).toEqual({ value: 'Hel', error: null });
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: 'Testing', error: null });
        const result = calculator.calculate('LEFT(A1, 4)');
        expect(result).toEqual({ value: 'Test', error: null });
      });

      it('should require exactly 2 arguments', () => {
        const result = calculator.calculate('LEFT("text")');
        expect(result.error).toContain('requires exactly 2 arguments');
      });
    });

    describe('RIGHT', () => {
      it('should extract characters from right', () => {
        const result = calculator.calculate('RIGHT("Hello", 3)');
        expect(result).toEqual({ value: 'llo', error: null });
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: 'Testing', error: null });
        const result = calculator.calculate('RIGHT(A1, 3)');
        expect(result).toEqual({ value: 'ing', error: null });
      });

      it('should require exactly 2 arguments', () => {
        const result = calculator.calculate('RIGHT("text")');
        expect(result.error).toContain('requires exactly 2 arguments');
      });
    });

    describe('TRIM', () => {
      it('should remove leading and trailing spaces', () => {
        const result = calculator.calculate('TRIM("  hello  ")');
        expect(result).toEqual({ value: 'hello', error: null });
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: '  spaces  ', error: null });
        const result = calculator.calculate('TRIM(A1)');
        expect(result).toEqual({ value: 'spaces', error: null });
      });

      it('should require exactly 1 argument', () => {
        const result = calculator.calculate('TRIM()');
        expect(result.error).toContain('requires exactly 1 argument');
      });
    });

    describe('UPPER', () => {
      it('should convert text to uppercase', () => {
        const result = calculator.calculate('UPPER("hello")');
        expect(result).toEqual({ value: 'HELLO', error: null });
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: 'test', error: null });
        const result = calculator.calculate('UPPER(A1)');
        expect(result).toEqual({ value: 'TEST', error: null });
      });

      it('should require exactly 1 argument', () => {
        const result = calculator.calculate('UPPER()');
        expect(result.error).toContain('requires exactly 1 argument');
      });
    });

    describe('LOWER', () => {
      it('should convert text to lowercase', () => {
        const result = calculator.calculate('LOWER("HELLO")');
        expect(result).toEqual({ value: 'hello', error: null });
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: 'TEST', error: null });
        const result = calculator.calculate('LOWER(A1)');
        expect(result).toEqual({ value: 'test', error: null });
      });

      it('should require exactly 1 argument', () => {
        const result = calculator.calculate('LOWER()');
        expect(result.error).toContain('requires exactly 1 argument');
      });
    });
  });

  describe('comparison operators', () => {
    it('should handle equals comparison', () => {
      const result = calculator.calculate('5 = 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle not equals when false', () => {
      const result = calculator.calculate('5 = 3');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should handle not equals comparison (<>)', () => {
      const result = calculator.calculate('5 <> 3');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle not equals when false', () => {
      const result = calculator.calculate('5 <> 5');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should handle less than', () => {
      const result = calculator.calculate('3 < 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle less than when false', () => {
      const result = calculator.calculate('5 < 3');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should handle greater than', () => {
      const result = calculator.calculate('5 > 3');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle greater than when false', () => {
      const result = calculator.calculate('3 > 5');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should handle less than or equal', () => {
      const result = calculator.calculate('3 <= 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle less than or equal when equal', () => {
      const result = calculator.calculate('5 <= 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle greater than or equal', () => {
      const result = calculator.calculate('5 >= 3');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle greater than or equal when equal', () => {
      const result = calculator.calculate('5 >= 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle comparisons with cell references', () => {
      cellResults.set('A1', { value: 10, error: null });
      cellResults.set('A2', { value: 5, error: null });

      const result = calculator.calculate('A1 > A2');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle comparisons with expressions', () => {
      const result = calculator.calculate('(2 + 3) > 4');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle string equality', () => {
      const result = calculator.calculate('"hello" = "hello"');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle string inequality', () => {
      const result = calculator.calculate('"hello" = "world"');
      expect(result).toEqual({ value: 0, error: null });
    });

    it('should use comparison result in IF function', () => {
      cellResults.set('A1', { value: 10, error: null });
      const result = calculator.calculate('IF(A1 > 5, "High", "Low")');
      expect(result).toEqual({ value: 'High', error: null });
    });

    it('should use comparison result in IF function when false', () => {
      cellResults.set('A1', { value: 3, error: null });
      const result = calculator.calculate('IF(A1 > 5, "High", "Low")');
      expect(result).toEqual({ value: 'Low', error: null });
    });

    it('should handle == as alias for =', () => {
      const result = calculator.calculate('5 == 5');
      expect(result).toEqual({ value: 1, error: null });
    });

    it('should handle != as alias for <>', () => {
      const result = calculator.calculate('5 != 3');
      expect(result).toEqual({ value: 1, error: null });
    });
  });

  describe('date/time functions', () => {
    describe('NOW', () => {
      it('should return current timestamp', () => {
        const before = Date.now();
        const result = calculator.calculate('NOW()');
        const after = Date.now();

        expect(result.error).toBeNull();
        expect(typeof result.value).toBe('number');
        expect(result.value).toBeGreaterThanOrEqual(before);
        expect(result.value).toBeLessThanOrEqual(after);
      });

      it('should require no arguments', () => {
        const result = calculator.calculate('NOW(1)');
        expect(result.error).toContain('requires no arguments');
      });
    });

    describe('TODAY', () => {
      it('should return current date at midnight', () => {
        const result = calculator.calculate('TODAY()');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        expect(result.error).toBeNull();
        expect(result.value).toBe(today.getTime());
      });

      it('should require no arguments', () => {
        const result = calculator.calculate('TODAY(1)');
        expect(result.error).toContain('requires no arguments');
      });
    });

    describe('DATE', () => {
      it('should create date from year, month, day', () => {
        const result = calculator.calculate('DATE(2024, 3, 15)');
        const expected = new Date(2024, 2, 15).getTime(); // Month is 0-indexed

        expect(result.error).toBeNull();
        expect(result.value).toBe(expected);
      });

      it('should work with cell references', () => {
        cellResults.set('A1', { value: 2023, error: null });
        cellResults.set('A2', { value: 12, error: null });
        cellResults.set('A3', { value: 25, error: null });

        const result = calculator.calculate('DATE(A1, A2, A3)');
        const expected = new Date(2023, 11, 25).getTime();

        expect(result.error).toBeNull();
        expect(result.value).toBe(expected);
      });

      it('should require exactly 3 arguments', () => {
        const result = calculator.calculate('DATE(2024, 3)');
        expect(result.error).toContain('requires exactly 3 arguments');
      });
    });

    describe('DATEDIF', () => {
      it('should calculate difference in days', () => {
        const start = new Date(2024, 0, 1).getTime();
        const end = new Date(2024, 0, 11).getTime();

        const result = calculator.calculate(`DATEDIF(${start}, ${end}, "D")`);
        expect(result).toEqual({ value: 10, error: null });
      });

      it('should calculate difference in months', () => {
        const start = new Date(2024, 0, 1).getTime();
        const end = new Date(2024, 3, 1).getTime();

        const result = calculator.calculate(`DATEDIF(${start}, ${end}, "M")`);
        expect(result).toEqual({ value: 3, error: null });
      });

      it('should calculate difference in years', () => {
        const start = new Date(2020, 0, 1).getTime();
        const end = new Date(2024, 0, 1).getTime();

        const result = calculator.calculate(`DATEDIF(${start}, ${end}, "Y")`);
        expect(result).toEqual({ value: 4, error: null });
      });

      it('should work with DATE function', () => {
        const result = calculator.calculate('DATEDIF(DATE(2024, 1, 1), DATE(2024, 12, 31), "M")');
        expect(result).toEqual({ value: 11, error: null });
      });

      it('should handle lowercase units', () => {
        const start = new Date(2024, 0, 1).getTime();
        const end = new Date(2025, 0, 1).getTime();

        const result = calculator.calculate(`DATEDIF(${start}, ${end}, "y")`);
        expect(result).toEqual({ value: 1, error: null });
      });

      it('should require exactly 3 arguments', () => {
        const result = calculator.calculate('DATEDIF(1, 2)');
        expect(result.error).toContain('requires exactly 3 arguments');
      });

      it('should handle invalid unit', () => {
        const start = new Date(2024, 0, 1).getTime();
        const end = new Date(2024, 0, 11).getTime();

        const result = calculator.calculate(`DATEDIF(${start}, ${end}, "X")`);
        expect(result.error).toContain('Invalid unit');
      });
    });
  });
});
