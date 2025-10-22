import { describe, it, expect } from 'vitest';
import { match } from '../match';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

/**
 * Helper to create 2D array from values
 */
function to2D(...values: (number | string | null)[]): (number | string | null)[][] {
  return [values];
}

describe('MATCH function', () => {
  describe('Exact match (match_type = 0)', () => {
    it('should find exact numeric match', () => {
      const result = match([5, to2D(1, 3, 5, 7, 9), 0]);
      expect(result).toBe(3); // 1-based position
    });

    it('should find exact string match (case-insensitive)', () => {
      const result = match(['apple', to2D('Orange', 'Banana', 'Apple', 'Grape'), 0]);
      expect(result).toBe(3);
    });

    it('should find exact match in column range', () => {
      const result = match([10, [[5], [10], [15], [20]], 0]);
      expect(result).toBe(2);
    });

    it('should throw error when exact match not found', () => {
      expect(() => match([6, to2D(1, 3, 5, 7, 9), 0])).toThrow(FunctionArgumentError);
      expect(() => match([6, to2D(1, 3, 5, 7, 9), 0])).toThrow('Value "6" not found');
    });

    it('should throw error when string not found', () => {
      expect(() => match(['Mango', to2D('Orange', 'Banana', 'Apple'), 0])).toThrow(
        FunctionArgumentError
      );
    });

    it('should skip null values in exact match', () => {
      const result = match([7, to2D(1, null, 5, 7, null, 9), 0]);
      expect(result).toBe(4); // Position 4 (skipping nulls)
    });
  });

  describe('Approximate match - ascending (match_type = 1)', () => {
    it('should find largest value <= lookup_value (sorted ascending)', () => {
      const result = match([7, to2D(1, 3, 5, 7, 9), 1]);
      expect(result).toBe(4); // Exact match at position 4
    });

    it('should find largest value < lookup_value when no exact match', () => {
      const result = match([6, to2D(1, 3, 5, 7, 9), 1]);
      expect(result).toBe(3); // 5 is largest value <= 6
    });

    it('should use default match_type of 1 when omitted', () => {
      const result = match([6, to2D(1, 3, 5, 7, 9)]);
      expect(result).toBe(3);
    });

    it('should throw error when all values are greater than lookup_value', () => {
      expect(() => match([0, to2D(1, 3, 5, 7, 9), 1])).toThrow(FunctionArgumentError);
      expect(() => match([0, to2D(1, 3, 5, 7, 9), 1])).toThrow('No value <= "0" found');
    });

    it('should skip null values in approximate match', () => {
      const result = match([6, to2D(1, null, 3, 5, null, 7, 9), 1]);
      expect(result).toBe(4); // 5 is at position 4
    });
  });

  describe('Approximate match - descending (match_type = -1)', () => {
    it('should find smallest value >= lookup_value (sorted descending)', () => {
      const result = match([7, to2D(9, 7, 5, 3, 1), -1]);
      expect(result).toBe(2); // Exact match at position 2
    });

    it('should find smallest value > lookup_value when no exact match', () => {
      const result = match([6, to2D(9, 7, 5, 3, 1), -1]);
      expect(result).toBe(2); // 7 is smallest value >= 6
    });

    it('should throw error when all values are less than lookup_value', () => {
      expect(() => match([10, to2D(9, 7, 5, 3, 1), -1])).toThrow(FunctionArgumentError);
      expect(() => match([10, to2D(9, 7, 5, 3, 1), -1])).toThrow('No value >= "10" found');
    });

    it('should skip null values in descending match', () => {
      const result = match([6, to2D(9, null, 7, 5, null, 3, 1), -1]);
      expect(result).toBe(3); // 7 is at position 3
    });
  });

  describe('Argument validation', () => {
    it('should throw error with fewer than 2 arguments', () => {
      expect(() => match([5])).toThrow(FunctionArgumentError);
      expect(() => match([5])).toThrow('MATCH requires 2 or 3 arguments');
    });

    it('should throw error with more than 3 arguments', () => {
      expect(() => match([5, to2D(1, 2, 3), 0, 'extra'])).toThrow(FunctionArgumentError);
    });

    it('should throw error when match_type is invalid', () => {
      expect(() => match([5, to2D(1, 2, 3), 2])).toThrow(FunctionArgumentError);
      expect(() => match([5, to2D(1, 2, 3), 2])).toThrow('match_type must be -1, 0, or 1');
    });

    it('should throw error when lookup_value is a range', () => {
      expect(() => match([to2D(1, 2), to2D(1, 2, 3), 0])).toThrow(FunctionArgumentError);
      expect(() => match([to2D(1, 2), to2D(1, 2, 3), 0])).toThrow(
        'lookup_value must be a single value'
      );
    });

    it('should throw error when match_type is a range', () => {
      expect(() => match([5, to2D(1, 2, 3), to2D(0, 1)])).toThrow(FunctionArgumentError);
      expect(() => match([5, to2D(1, 2, 3), to2D(0, 1)])).toThrow(
        'match_type must be a single value'
      );
    });

    it('should throw error when lookup_array is empty', () => {
      expect(() => match([5, [[]], 0])).toThrow(FunctionArgumentError);
      expect(() => match([5, [[]], 0])).toThrow('lookup_array cannot be empty');
    });
  });

  describe('Type handling', () => {
    it('should convert string numbers to numbers for comparison', () => {
      const result = match(['7', to2D(1, 3, 5, 7, 9), 1]);
      expect(result).toBe(4);
    });

    it('should work with mixed numeric types', () => {
      const result = match([5.0, to2D(1, 3, 5, 7, 9), 0]);
      expect(result).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should work with single-element array', () => {
      const result = match([5, to2D(5), 0]);
      expect(result).toBe(1);
    });

    it('should work with scalar lookup_array (converted to array)', () => {
      const result = match([5, 5, 0]);
      expect(result).toBe(1);
    });

    it('should work with vertical range (column)', () => {
      const result = match([15, [[5], [10], [15], [20]], 0]);
      expect(result).toBe(3);
    });

    it('should work with 2D range flattened to 1D', () => {
      const result = match([
        7,
        [
          [1, 3, 5],
          [7, 9, 11],
        ],
        0,
      ]);
      expect(result).toBe(4); // 7 is at position 4 when flattened row-major
    });
  });
});
