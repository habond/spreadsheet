import { describe, it, expect } from 'vitest';
import { sumif } from '../sumif';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

describe('SUMIF function', () => {
  describe('two-argument form (range and criteria)', () => {
    it('should sum values matching exact criteria', () => {
      const range = [10, 20, 30, 20, 40];
      const result = sumif([range, '20']);
      expect(result).toBe(40); // 20 + 20
    });

    it('should sum values matching comparison criteria', () => {
      const range = [10, 20, 30, 40, 50];
      const result = sumif([range, '>30']);
      expect(result).toBe(90); // 40 + 50
    });

    it('should return 0 for no matches', () => {
      const range = [10, 20, 30];
      const result = sumif([range, '>50']);
      expect(result).toBe(0);
    });
  });

  describe('three-argument form (range, criteria, sum_range)', () => {
    it('should sum from sum_range based on criteria in range', () => {
      const range = ['apple', 'banana', 'apple', 'cherry'];
      const sumRange = [10, 20, 30, 40];
      const result = sumif([range, 'apple', sumRange]);
      expect(result).toBe(40); // 10 + 30
    });

    it('should sum with numeric criteria and different sum_range', () => {
      const range = [1, 2, 3, 2, 1];
      const sumRange = [100, 200, 300, 200, 100];
      const result = sumif([range, '2', sumRange]);
      expect(result).toBe(400); // 200 + 200
    });

    it('should work with comparison criteria', () => {
      const range = [10, 20, 30, 40, 50];
      const sumRange = [1, 2, 3, 4, 5];
      const result = sumif([range, '>=30', sumRange]);
      expect(result).toBe(12); // 3 + 4 + 5
    });
  });

  describe('comparison operators', () => {
    it('should handle > operator', () => {
      const range = [10, 20, 30, 40, 50];
      const result = sumif([range, '>30']);
      expect(result).toBe(90); // 40 + 50
    });

    it('should handle < operator', () => {
      const range = [10, 20, 30, 40, 50];
      const result = sumif([range, '<30']);
      expect(result).toBe(30); // 10 + 20
    });

    it('should handle >= operator', () => {
      const range = [10, 20, 30, 40, 50];
      const result = sumif([range, '>=30']);
      expect(result).toBe(120); // 30 + 40 + 50
    });

    it('should handle <= operator', () => {
      const range = [10, 20, 30, 40, 50];
      const result = sumif([range, '<=30']);
      expect(result).toBe(60); // 10 + 20 + 30
    });

    it('should handle = operator', () => {
      const range = [10, 20, 30, 20, 40];
      const result = sumif([range, '=20']);
      expect(result).toBe(40); // 20 + 20
    });

    it('should handle <> operator', () => {
      const range = [10, 20, 30, 20, 40];
      const result = sumif([range, '<>20']);
      expect(result).toBe(80); // 10 + 30 + 40
    });
  });

  describe('error handling', () => {
    it('should require 2 or 3 arguments', () => {
      expect(() => sumif([1])).toThrow(FunctionArgumentError);
      expect(() => sumif([1])).toThrow('requires 2 or 3 arguments');

      expect(() => sumif([1, 2, 3, 4])).toThrow(FunctionArgumentError);
    });

    it('should require first argument to be a range', () => {
      expect(() => sumif([10, '>5'])).toThrow(FunctionArgumentError);
      expect(() => sumif([10, '>5'])).toThrow('first argument must be a range');
    });

    it('should require sum_range to be a range', () => {
      const range = [10, 20, 30];
      expect(() => sumif([range, '>10', 5])).toThrow(FunctionArgumentError);
      expect(() => sumif([range, '>10', 5])).toThrow('sum_range must be a range');
    });

    it('should require ranges to be same size', () => {
      const range = [10, 20, 30];
      const sumRange = [1, 2];
      expect(() => sumif([range, '>10', sumRange])).toThrow(FunctionArgumentError);
      expect(() => sumif([range, '>10', sumRange])).toThrow('must be the same size');
    });

    it('should throw error for invalid comparison value', () => {
      const range = [10, 20, 30];
      expect(() => sumif([range, '>abc'])).toThrow(FunctionArgumentError);
      expect(() => sumif([range, '>abc'])).toThrow('invalid comparison value');
    });
  });

  describe('edge cases', () => {
    it('should handle empty range', () => {
      const result = sumif([[], '10']);
      expect(result).toBe(0);
    });

    it('should skip non-numeric values in range for comparisons', () => {
      const range = [10, 'apple', 30, 'banana', 50];
      const result = sumif([range, '>20']);
      expect(result).toBe(80); // 30 + 50
    });

    it('should handle text matching (case-insensitive)', () => {
      const range = ['Apple', 'BANANA', 'apple', 'Cherry'];
      const sumRange = [10, 20, 30, 40];
      const result = sumif([range, 'apple', sumRange]);
      expect(result).toBe(40); // 10 + 30
    });

    it('should handle mixed numeric and string values', () => {
      const range = [10, '20', 30, '20', 40];
      const result = sumif([range, '20']);
      expect(result).toBe(40); // 20 + 20 (both string and number match)
    });
  });
});
