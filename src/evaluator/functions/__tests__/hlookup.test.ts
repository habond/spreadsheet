import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { hlookup } from '../hlookup';

describe('HLOOKUP function', () => {
  describe('Exact match (range_lookup = 0)', () => {
    it('should find exact numeric match and return value from specified row', () => {
      const table = [
        [1, 2, 3, 4, 5],
        [10, 20, 30, 40, 50],
        [100, 200, 300, 400, 500],
      ];
      const result = hlookup([3, table, 2, 0]);
      expect(result).toBe(30);
    });

    it('should find exact string match (case-insensitive)', () => {
      const table = [
        ['Product A', 'Product B', 'Product C'],
        [100, 200, 300],
        [10, 20, 30],
      ];
      const result = hlookup(['product b', table, 3, 0]);
      expect(result).toBe(20);
    });

    it('should return value from first data row (row 2)', () => {
      const table = [
        ['Name', 'Age', 'Score'],
        ['Alice', 25, 95],
      ];
      const result = hlookup(['Age', table, 2, 0]);
      expect(result).toBe(25);
    });

    it('should throw error when exact match not found', () => {
      const table = [
        [1, 2, 3, 4, 5],
        [10, 20, 30, 40, 50],
      ];
      expect(() => hlookup([6, table, 2, 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([6, table, 2, 0])).toThrow('Value "6" not found in first row');
    });

    it('should throw error when string not found', () => {
      const table = [
        ['Apple', 'Banana', 'Cherry'],
        [1, 2, 3],
      ];
      expect(() => hlookup(['Mango', table, 2, 0])).toThrow(FunctionArgumentError);
    });

    it('should skip null values in search', () => {
      const table = [
        [1, null, 3, null, 5],
        [10, 20, 30, 40, 50],
      ];
      const result = hlookup([5, table, 2, 0]);
      expect(result).toBe(50);
    });
  });

  describe('Approximate match (range_lookup = TRUE)', () => {
    it('should find largest value <= lookup_value (sorted ascending)', () => {
      const table = [
        [1, 5, 10, 15, 20],
        [100, 500, 1000, 1500, 2000],
      ];
      const result = hlookup([10, table, 2, 1]);
      expect(result).toBe(1000); // Exact match at column 3
    });

    it('should find largest value < lookup_value when no exact match', () => {
      const table = [
        [1, 5, 10, 15, 20],
        [100, 500, 1000, 1500, 2000],
      ];
      const result = hlookup([12, table, 2, 1]);
      expect(result).toBe(1000); // 10 is largest value <= 12
    });

    it('should use default range_lookup = TRUE when omitted', () => {
      const table = [
        [1, 5, 10, 15, 20],
        [100, 500, 1000, 1500, 2000],
      ];
      const result = hlookup([12, table, 2]);
      expect(result).toBe(1000);
    });

    it('should throw error when all values are greater than lookup_value', () => {
      const table = [
        [10, 20, 30, 40, 50],
        [100, 200, 300, 400, 500],
      ];
      expect(() => hlookup([5, table, 2, 1])).toThrow(FunctionArgumentError);
      expect(() => hlookup([5, table, 2, 1])).toThrow('No value <= "5" found in first row');
    });

    it('should skip null values in approximate match', () => {
      const table = [
        [1, null, 5, 10, null, 15],
        [100, 200, 500, 1000, 1100, 1500],
      ];
      const result = hlookup([12, table, 2, 1]);
      expect(result).toBe(1000); // 10 is largest value <= 12
    });
  });

  describe('Multiple rows', () => {
    it('should return value from specified row (3rd row)', () => {
      const table = [
        ['Q1', 'Q2', 'Q3', 'Q4'],
        [100, 150, 200, 250],
        [10, 15, 20, 25],
        [1000, 1500, 2000, 2500],
      ];
      const result = hlookup(['Q3', table, 4, 0]);
      expect(result).toBe(2000);
    });

    it('should work with different row indices', () => {
      const table = [
        ['A', 'B', 'C'],
        [1, 2, 3],
        [10, 20, 30],
        [100, 200, 300],
      ];
      expect(hlookup(['B', table, 2, 0])).toBe(2);
      expect(hlookup(['B', table, 3, 0])).toBe(20);
      expect(hlookup(['B', table, 4, 0])).toBe(200);
    });
  });

  describe('Argument validation', () => {
    it('should throw error with fewer than 3 arguments', () => {
      expect(() => hlookup([1, [[1, 2]]])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, [[1, 2]]])).toThrow('requires between 3 and 4 arguments');
    });

    it('should throw error with more than 4 arguments', () => {
      expect(() => hlookup([1, [[1, 2]], 2, 0, 'extra'])).toThrow(FunctionArgumentError);
    });

    it('should throw error when table_array is not 2D', () => {
      // @ts-expect-error - Testing invalid input (1D array instead of 2D)
      expect(() => hlookup([1, [1, 2, 3], 2, 0])).toThrow(FunctionArgumentError);
      // @ts-expect-error - Testing invalid input (1D array instead of 2D)
      expect(() => hlookup([1, [1, 2, 3], 2, 0])).toThrow('table_array must be a 2D range');
    });

    it('should throw error when table_array is empty', () => {
      expect(() => hlookup([1, [], 2, 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, [], 2, 0])).toThrow('table_array must be a 2D range');
    });

    it('should throw error when row_index_num is not positive integer', () => {
      expect(() => hlookup([1, [[1, 2]], 0, 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, [[1, 2]], 0, 0])).toThrow(
        'row_index_num must be a positive integer'
      );
    });

    it('should throw error when row_index_num is negative', () => {
      expect(() => hlookup([1, [[1, 2]], -1, 0])).toThrow(FunctionArgumentError);
    });

    it('should throw error when row_index_num is not an integer', () => {
      expect(() => hlookup([1, [[1, 2]], 1.5, 0])).toThrow(FunctionArgumentError);
    });

    it('should throw error when row_index_num is out of range', () => {
      const table = [
        [1, 2, 3],
        [10, 20, 30],
      ];
      expect(() => hlookup([1, table, 5, 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, table, 5, 0])).toThrow(
        'row_index_num 5 is out of range (table has 2 rows)'
      );
    });

    it('should throw error when lookup_value is a range', () => {
      expect(() => hlookup([[[1, 2]], [[1, 2]], 2, 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([[[1, 2]], [[1, 2]], 2, 0])).toThrow(
        'lookup_value must be a single value'
      );
    });

    it('should throw error when row_index_num is a range', () => {
      expect(() => hlookup([1, [[1, 2]], [[2, 3]], 0])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, [[1, 2]], [[2, 3]], 0])).toThrow(
        'row_index_num must be a single value'
      );
    });

    it('should throw error when range_lookup is a range', () => {
      expect(() => hlookup([1, [[1, 2]], 2, [[1, 0]]])).toThrow(FunctionArgumentError);
      expect(() => hlookup([1, [[1, 2]], 2, [[1, 0]]])).toThrow(
        'range_lookup must be a single value'
      );
    });
  });

  describe('Null handling', () => {
    it('should throw error when result cell is null', () => {
      const table = [
        [1, 2, 3],
        [10, null, 30],
      ];
      expect(() => hlookup([2, table, 2, 0])).toThrow(FormulaParseError);
      expect(() => hlookup([2, table, 2, 0])).toThrow('HLOOKUP: result cell is empty');
    });

    it('should throw error when approximate match result is null', () => {
      const table = [
        [1, 5, 10],
        [10, null, 30],
      ];
      expect(() => hlookup([6, table, 2, 1])).toThrow(FormulaParseError);
    });
  });

  describe('Type handling', () => {
    it('should work with string values in result', () => {
      const table = [
        [1, 2, 3],
        ['Apple', 'Banana', 'Cherry'],
      ];
      const result = hlookup([2, table, 2, 0]);
      expect(result).toBe('Banana');
    });

    it('should work with mixed types', () => {
      const table = [
        ['A', 'B', 'C'],
        [100, 'Two Hundred', 300],
      ];
      const result = hlookup(['B', table, 2, 0]);
      expect(result).toBe('Two Hundred');
    });

    it('should convert string lookup_value to number for approximate match', () => {
      const table = [
        [1, 5, 10, 15],
        [100, 500, 1000, 1500],
      ];
      const result = hlookup(['7', table, 2, 1]);
      expect(result).toBe(500); // 5 is largest value <= 7
    });

    it('should convert boolean to number for range_lookup', () => {
      const table = [
        [1, 2, 3],
        [10, 20, 30],
      ];
      const result = hlookup([2, table, 2, 1]); // 1 = 1
      expect(result).toBe(20);
    });
  });

  describe('Edge cases', () => {
    it('should work with single column table', () => {
      const table = [[1], [10], [100]];
      const result = hlookup([1, table, 3, 0]);
      expect(result).toBe(100);
    });

    it('should work with two-row table', () => {
      const table = [
        [1, 2, 3],
        [10, 20, 30],
      ];
      const result = hlookup([3, table, 2, 0]);
      expect(result).toBe(30);
    });

    it('should work with large table', () => {
      const firstRow = Array.from({ length: 100 }, (_, i) => i + 1);
      const secondRow = Array.from({ length: 100 }, (_, i) => (i + 1) * 10);
      const table = [firstRow, secondRow];
      const result = hlookup([50, table, 2, 0]);
      expect(result).toBe(500);
    });

    it('should handle first column match in exact mode', () => {
      const table = [
        [1, 5, 10],
        [100, 500, 1000],
      ];
      const result = hlookup([1, table, 2, 0]);
      expect(result).toBe(100);
    });

    it('should handle last column match in exact mode', () => {
      const table = [
        [1, 5, 10],
        [100, 500, 1000],
      ];
      const result = hlookup([10, table, 2, 0]);
      expect(result).toBe(1000);
    });
  });
});
