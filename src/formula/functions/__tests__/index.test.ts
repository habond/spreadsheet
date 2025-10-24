import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { index } from '../index';

describe('INDEX function', () => {
  describe('1D array (single row)', () => {
    it('should return value at specified position in horizontal range', () => {
      const result = index([[[10, 20, 30, 40, 50]], 1, 3]);
      expect(result).toBe(30);
    });

    it('should return first element with position 1', () => {
      const result = index([[[10, 20, 30]], 1, 1]);
      expect(result).toBe(10);
    });

    it('should return last element in range', () => {
      const result = index([[[10, 20, 30, 40, 50]], 1, 5]);
      expect(result).toBe(50);
    });

    it('should work with column_num = 1 for 1D array', () => {
      const result = index([[[10, 20, 30]], 1, 2]);
      expect(result).toBe(20);
    });

    it('should throw error when row_num is out of range', () => {
      expect(() => index([[[10, 20, 30]], 5, 1])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20, 30]], 5, 1])).toThrow(
        'row_num 5 is out of range (array has 1 rows)'
      );
    });

    it('should throw error when column_num is out of range', () => {
      expect(() => index([[[10, 20, 30]], 1, 5])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20, 30]], 1, 5])).toThrow(
        'column_num 5 is out of range (array has 3 columns)'
      );
    });
  });

  describe('1D array (single column)', () => {
    it('should return value at specified position in vertical range', () => {
      const result = index([[[10], [20], [30], [40], [50]], 3, 1]);
      expect(result).toBe(30);
    });

    it('should return first element in column', () => {
      const result = index([[[10], [20], [30]], 1, 1]);
      expect(result).toBe(10);
    });

    it('should throw error when row_num is out of range for column', () => {
      expect(() => index([[[10], [20], [30]], 4, 1])).toThrow(FunctionArgumentError);
      expect(() => index([[[10], [20], [30]], 4, 1])).toThrow(
        'row_num 4 is out of range (array has 3 rows)'
      );
    });
  });

  describe('2D array', () => {
    it('should return value at specified row and column', () => {
      const result = index([
        [
          [10, 20, 30],
          [40, 50, 60],
          [70, 80, 90],
        ],
        2,
        3,
      ]);
      expect(result).toBe(60);
    });

    it('should return first element with position (1, 1)', () => {
      const result = index([
        [
          [10, 20],
          [30, 40],
        ],
        1,
        1,
      ]);
      expect(result).toBe(10);
    });

    it('should return value from last row and column', () => {
      const result = index([
        [
          [10, 20, 30],
          [40, 50, 60],
          [70, 80, 90],
        ],
        3,
        3,
      ]);
      expect(result).toBe(90);
    });

    it('should return value when array has single column (2D with col_num)', () => {
      const result = index([[[10], [20], [30]], 2, 1]);
      expect(result).toBe(20);
    });

    it('should throw error when row_num is out of range', () => {
      expect(() =>
        index([
          [
            [10, 20],
            [30, 40],
          ],
          3,
          1,
        ])
      ).toThrow(FunctionArgumentError);
      expect(() =>
        index([
          [
            [10, 20],
            [30, 40],
          ],
          3,
          1,
        ])
      ).toThrow('row_num 3 is out of range (array has 2 rows)');
    });

    it('should throw error when column_num is out of range', () => {
      expect(() =>
        index([
          [
            [10, 20],
            [30, 40],
          ],
          1,
          3,
        ])
      ).toThrow(FunctionArgumentError);
      expect(() =>
        index([
          [
            [10, 20],
            [30, 40],
          ],
          1,
          3,
        ])
      ).toThrow('column_num 3 is out of range (array has 2 columns)');
    });

    it('should throw error when column_num is required but omitted', () => {
      expect(() =>
        index([
          [
            [10, 20, 30],
            [40, 50, 60],
          ],
          1,
        ])
      ).toThrow(FunctionArgumentError);
      expect(() =>
        index([
          [
            [10, 20, 30],
            [40, 50, 60],
          ],
          1,
        ])
      ).toThrow('column_num is required when array has multiple columns');
    });
  });

  describe('Single value (scalar)', () => {
    it('should return scalar value when row_num = 1', () => {
      const result = index([42, 1]);
      expect(result).toBe(42);
    });

    it('should return scalar value when row_num = 1 and column_num = 1', () => {
      const result = index([42, 1, 1]);
      expect(result).toBe(42);
    });

    it('should throw error when row_num > 1 for scalar', () => {
      expect(() => index([42, 2])).toThrow(FunctionArgumentError);
      expect(() => index([42, 2])).toThrow('row_num 2 or column_num null is out of range');
    });

    it('should throw error when column_num > 1 for scalar', () => {
      expect(() => index([42, 1, 2])).toThrow(FunctionArgumentError);
      expect(() => index([42, 1, 2])).toThrow('row_num 1 or column_num 2 is out of range');
    });
  });

  describe('Argument validation', () => {
    it('should throw error with fewer than 2 arguments', () => {
      expect(() => index([[[10, 20]]])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20]]])).toThrow('requires between 2 and 3 arguments');
    });

    it('should throw error with more than 3 arguments', () => {
      expect(() => index([[[10, 20]], 1, 1, 'extra'])).toThrow(FunctionArgumentError);
    });

    it('should throw error when row_num is not positive integer', () => {
      expect(() => index([[[10, 20]], 0])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20]], 0])).toThrow('row_num must be a positive integer');
    });

    it('should throw error when row_num is negative', () => {
      expect(() => index([[[10, 20]], -1])).toThrow(FunctionArgumentError);
    });

    it('should throw error when row_num is not an integer', () => {
      expect(() => index([[[10, 20]], 1.5])).toThrow(FunctionArgumentError);
    });

    it('should throw error when column_num is not positive integer', () => {
      expect(() => index([[[10, 20]], 1, 0])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20]], 1, 0])).toThrow('column_num must be a positive integer');
    });

    it('should throw error when column_num is negative', () => {
      expect(() => index([[[10, 20]], 1, -1])).toThrow(FunctionArgumentError);
    });

    it('should throw error when row_num is a range', () => {
      expect(() => index([[[10, 20]], [[1, 2]]])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20]], [[1, 2]]])).toThrow(
        'row_num must be a single value, not a range'
      );
    });

    it('should throw error when column_num is a range', () => {
      expect(() => index([[[10, 20]], 1, [[1, 2]]])).toThrow(FunctionArgumentError);
      expect(() => index([[[10, 20]], 1, [[1, 2]]])).toThrow(
        'column_num must be a single value, not a range'
      );
    });

    it('should throw error when array is empty', () => {
      expect(() => index([[], 1])).toThrow(FunctionArgumentError);
      expect(() => index([[], 1])).toThrow('array cannot be empty');
    });
  });

  describe('Null handling', () => {
    it('should throw error when result cell is null (1D)', () => {
      expect(() => index([[[10, null, 30]], 1, 2])).toThrow(FormulaParseError);
      expect(() => index([[[10, null, 30]], 1, 2])).toThrow('INDEX: result cell is empty');
    });

    it('should throw error when result cell is null (2D)', () => {
      expect(() =>
        index([
          [
            [10, 20],
            [30, null],
          ],
          2,
          2,
        ])
      ).toThrow(FormulaParseError);
      expect(() =>
        index([
          [
            [10, 20],
            [30, null],
          ],
          2,
          2,
        ])
      ).toThrow('INDEX: result cell is empty');
    });

    it('should throw error when scalar is null', () => {
      // Use a 2D array with null instead of passing null directly
      expect(() => index([[[null]], 1, 1])).toThrow(FormulaParseError);
      expect(() => index([[[null]], 1, 1])).toThrow('INDEX: result cell is empty');
    });
  });

  describe('Type handling', () => {
    it('should work with string values', () => {
      const result = index([[['Apple', 'Banana', 'Cherry']], 1, 2]);
      expect(result).toBe('Banana');
    });

    it('should work with mixed numeric and string values', () => {
      const result = index([
        [
          [10, 'Twenty', 30],
          ['Forty', 50, 60],
        ],
        2,
        1,
      ]);
      expect(result).toBe('Forty');
    });

    it('should convert string row_num to number', () => {
      const result = index([[[10, 20, 30]], '1', '2']);
      expect(result).toBe(20);
    });
  });

  describe('Edge cases', () => {
    it('should work with single-cell array', () => {
      const result = index([[[42]], 1]);
      expect(result).toBe(42);
    });

    it('should work with single-cell array and both indices', () => {
      const result = index([[[42]], 1, 1]);
      expect(result).toBe(42);
    });

    it('should work with large array', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => [i + 1]);
      const result = index([largeArray, 50]);
      expect(result).toBe(50);
    });
  });
});
