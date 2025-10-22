import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { sumifs } from '../sumifs';
import { to2D } from './test-utils';

describe('SUMIFS function', () => {
  describe('single criteria', () => {
    it('should sum with one criteria range', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange1 = to2D([10, 20, 30, 40, 50]);
      const result = sumifs([sumRange, criteriaRange1, '>30']);
      expect(result).toBe(900); // 400 + 500
    });

    it('should handle exact match criteria', () => {
      const sumRange = to2D([100, 200, 300, 200, 100]);
      const criteriaRange1 = to2D(['apple', 'banana', 'apple', 'cherry', 'apple']);
      const result = sumifs([sumRange, criteriaRange1, 'apple']);
      expect(result).toBe(500); // 100 + 300 + 100
    });
  });

  describe('multiple criteria', () => {
    it('should sum with two criteria ranges (AND logic)', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange1 = to2D([10, 20, 30, 40, 50]);
      const criteriaRange2 = to2D(['A', 'B', 'A', 'A', 'B']);
      const result = sumifs([sumRange, criteriaRange1, '>20', criteriaRange2, 'A']);
      expect(result).toBe(700); // 300 (30>20 && A) + 400 (40>20 && A)
    });

    it('should sum with three criteria ranges', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange1 = to2D([10, 20, 30, 40, 50]);
      const criteriaRange2 = to2D(['A', 'B', 'A', 'A', 'B']);
      const criteriaRange3 = to2D([1, 2, 1, 1, 2]);
      const result = sumifs([
        sumRange,
        criteriaRange1,
        '>20',
        criteriaRange2,
        'A',
        criteriaRange3,
        '1',
      ]);
      expect(result).toBe(700); // 300 (30>20 && A && 1) + 400 (40>20 && A && 1)
    });

    it('should return 0 when no rows match all criteria', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange1 = to2D([10, 20, 30, 40, 50]);
      const criteriaRange2 = to2D(['A', 'B', 'A', 'A', 'B']);
      const result = sumifs([sumRange, criteriaRange1, '<10', criteriaRange2, 'C']);
      expect(result).toBe(0);
    });
  });

  describe('comparison operators', () => {
    it('should handle > operator', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange = to2D([10, 20, 30, 40, 50]);
      const result = sumifs([sumRange, criteriaRange, '>30']);
      expect(result).toBe(900); // 400 + 500
    });

    it('should handle < operator', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange = to2D([10, 20, 30, 40, 50]);
      const result = sumifs([sumRange, criteriaRange, '<30']);
      expect(result).toBe(300); // 100 + 200
    });

    it('should handle >= operator', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange = to2D([10, 20, 30, 40, 50]);
      const result = sumifs([sumRange, criteriaRange, '>=30']);
      expect(result).toBe(1200); // 300 + 400 + 500
    });

    it('should handle <= operator', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange = to2D([10, 20, 30, 40, 50]);
      const result = sumifs([sumRange, criteriaRange, '<=30']);
      expect(result).toBe(600); // 100 + 200 + 300
    });

    it('should handle = operator', () => {
      const sumRange = to2D([100, 200, 300, 200, 100]);
      const criteriaRange = to2D([10, 20, 30, 20, 10]);
      const result = sumifs([sumRange, criteriaRange, '=20']);
      expect(result).toBe(400); // 200 + 200
    });

    it('should handle <> operator', () => {
      const sumRange = to2D([100, 200, 300, 200, 100]);
      const criteriaRange = to2D([10, 20, 30, 20, 10]);
      const result = sumifs([sumRange, criteriaRange, '<>20']);
      expect(result).toBe(500); // 100 + 300 + 100
    });
  });

  describe('mixed criteria types', () => {
    it('should handle mix of comparison and exact match criteria', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const numRange = to2D([10, 20, 30, 40, 50]);
      const textRange = to2D(['A', 'B', 'A', 'A', 'B']);
      const result = sumifs([sumRange, numRange, '>25', textRange, 'A']);
      expect(result).toBe(700); // 300 (30>25 && A) + 400 (40>25 && A)
    });
  });

  describe('error handling', () => {
    it('should require at least 3 arguments', () => {
      expect(() => sumifs([1, 2])).toThrow(FunctionArgumentError);
      expect(() => sumifs([1, 2])).toThrow(
        'requires sum_range and at least one criteria_range/criteria pair'
      );
    });

    it('should require odd number of arguments', () => {
      expect(() => sumifs([1, 2, 3, 4])).toThrow(FunctionArgumentError);
      expect(() => sumifs([1, 2, 3, 4])).toThrow('odd number of arguments');
    });

    it('should require sum_range to be a range', () => {
      expect(() => sumifs([10, [[1], [2], [3]], '>5'])).toThrow(FunctionArgumentError);
      expect(() => sumifs([10, [[1], [2], [3]], '>5'])).toThrow('sum_range must be a range');
    });

    it('should require criteria_range to be a range', () => {
      const sumRange = to2D([100, 200, 300]);
      expect(() => sumifs([sumRange, 10, '>5'])).toThrow(FunctionArgumentError);
      expect(() => sumifs([sumRange, 10, '>5'])).toThrow('criteria_range1 must be a range');
    });

    it('should require all ranges to be same size', () => {
      const sumRange = to2D([100, 200, 300]);
      const criteriaRange = to2D([10, 20]);
      expect(() => sumifs([sumRange, criteriaRange, '>5'])).toThrow(FunctionArgumentError);
      expect(() => sumifs([sumRange, criteriaRange, '>5'])).toThrow(
        'all ranges must be the same size'
      );
    });

    it('should throw error for invalid comparison value', () => {
      const sumRange = to2D([100, 200, 300]);
      const criteriaRange = to2D([10, 20, 30]);
      expect(() => sumifs([sumRange, criteriaRange, '>abc'])).toThrow(FunctionArgumentError);
      expect(() => sumifs([sumRange, criteriaRange, '>abc'])).toThrow('invalid comparison value');
    });
  });

  describe('edge cases', () => {
    it('should handle empty ranges', () => {
      const result = sumifs([[[]], [[]], '10']);
      expect(result).toBe(0);
    });

    it('should skip non-numeric values in criteria range for comparisons', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange = to2D([10, 'apple', 30, 'banana', 50]);
      const result = sumifs([sumRange, criteriaRange, '>20']);
      expect(result).toBe(800); // 300 + 500 (skips 'apple' and 'banana')
    });

    it('should handle text matching (case-insensitive)', () => {
      const sumRange = to2D([100, 200, 300, 400]);
      const criteriaRange = to2D(['Apple', 'BANANA', 'apple', 'Cherry']);
      const result = sumifs([sumRange, criteriaRange, 'apple']);
      expect(result).toBe(400); // 100 + 300
    });

    it('should handle all criteria being exact matches', () => {
      const sumRange = to2D([100, 200, 300, 400, 500]);
      const criteriaRange1 = to2D(['A', 'B', 'A', 'A', 'B']);
      const criteriaRange2 = to2D([1, 2, 1, 2, 1]);
      const result = sumifs([sumRange, criteriaRange1, 'A', criteriaRange2, '1']);
      expect(result).toBe(400); // 100 (A && 1) + 300 (A && 1)
    });
  });
});
