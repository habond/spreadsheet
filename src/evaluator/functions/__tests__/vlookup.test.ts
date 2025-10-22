import { describe, it, expect } from 'vitest';
import { vlookup } from '../vlookup';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { CellRangeValues } from '../../../types/core';

/**
 * Helper to convert flat array to 2D array (for testing)
 */
function to2D(values: (number | string | null)[][]): CellRangeValues {
  return values as CellRangeValues;
}

describe('vlookup', () => {
  describe('argument validation', () => {
    it('should require 3 or 4 arguments', () => {
      expect(() => vlookup([])).toThrow(FunctionArgumentError);
      expect(() => vlookup([1, to2D([[1, 2]]), 2, 0, 'extra'])).toThrow(FunctionArgumentError);
    });

    it('should require table_range to be a 2D array', () => {
      expect(() => vlookup([1, 'not-a-range' as unknown as CellRangeValues, 2])).toThrow(
        FunctionArgumentError
      );
      expect(() => vlookup([1, [1, 2, 3] as unknown as CellRangeValues, 2])).toThrow(
        FunctionArgumentError
      );
    });

    it('should require col_index_num to be a positive integer', () => {
      const range = to2D([
        [1, 'A'],
        [2, 'B'],
      ]);

      expect(() => vlookup([1, range, 0])).toThrow(FunctionArgumentError);
      expect(() => vlookup([1, range, -1])).toThrow(FunctionArgumentError);
      expect(() => vlookup([1, range, 1.5])).toThrow(FunctionArgumentError);
    });

    it('should throw error if col_index_num exceeds number of columns', () => {
      const range = to2D([
        [1, 'A'],
        [2, 'B'],
      ]);

      expect(() => vlookup([1, range, 3])).toThrow(FunctionArgumentError);
      expect(() => vlookup([1, range, 10])).toThrow(FunctionArgumentError);
    });
  });

  describe('exact match (range_lookup = 0 or FALSE)', () => {
    const productTable = to2D([
      ['Product A', 100, 'Electronics'],
      ['Product B', 50, 'Books'],
      ['Product C', 75, 'Clothing'],
      ['Product D', 200, 'Electronics'],
      ['Product E', 30, 'Books'],
    ]);

    it('should find exact text match (case-insensitive)', () => {
      expect(vlookup(['Product A', productTable, 2])).toBe(100);
      expect(vlookup(['product a', productTable, 2])).toBe(100); // case-insensitive
      expect(vlookup(['PRODUCT A', productTable, 2])).toBe(100); // case-insensitive
    });

    it('should return value from specified column', () => {
      expect(vlookup(['Product B', productTable, 1])).toBe('Product B'); // Column 1
      expect(vlookup(['Product B', productTable, 2])).toBe(50); // Column 2
      expect(vlookup(['Product B', productTable, 3])).toBe('Books'); // Column 3
    });

    it('should find exact numeric match', () => {
      const numericTable = to2D([
        [1, 'One'],
        [2, 'Two'],
        [3, 'Three'],
      ]);

      expect(vlookup([2, numericTable, 2])).toBe('Two');
      expect(vlookup([3, numericTable, 2])).toBe('Three');
    });

    it('should throw error if no match found', () => {
      expect(() => vlookup(['Product Z', productTable, 2])).toThrow(FormulaParseError);
      expect(() => vlookup(['NonExistent', productTable, 2])).toThrow(FormulaParseError);
    });

    it('should skip null/empty cells in search', () => {
      const tableWithNulls = to2D([
        [null, 'Empty'],
        ['Product A', 100],
        [null, 'Another Empty'],
      ]);

      expect(vlookup(['Product A', tableWithNulls, 2])).toBe(100);
    });

    it('should throw error if result cell is empty', () => {
      const tableWithNullResult = to2D([
        ['Product A', null],
        ['Product B', 50],
      ]);

      expect(() => vlookup(['Product A', tableWithNullResult, 2])).toThrow(FormulaParseError);
    });

    it('should use exact match by default (no 4th argument)', () => {
      expect(vlookup(['Product C', productTable, 2])).toBe(75);
    });

    it('should use exact match when range_lookup = 0', () => {
      expect(vlookup(['Product C', productTable, 2, 0])).toBe(75);
    });

    it('should use exact match when range_lookup = FALSE', () => {
      expect(vlookup(['Product C', productTable, 2, 0])).toBe(75);
    });
  });

  describe('approximate match (range_lookup = 1 or TRUE)', () => {
    // Sorted table for approximate match
    const scoreLookup = to2D([
      [0, 'F'],
      [60, 'D'],
      [70, 'C'],
      [80, 'B'],
      [90, 'A'],
    ]);

    it('should find largest value <= lookup_value', () => {
      expect(vlookup([85, scoreLookup, 2, 1])).toBe('B'); // 85 falls in 80-89 range
      expect(vlookup([95, scoreLookup, 2, 1])).toBe('A'); // 95 is >= 90
      expect(vlookup([75, scoreLookup, 2, 1])).toBe('C'); // 75 falls in 70-79 range
    });

    it('should find exact match if available', () => {
      expect(vlookup([90, scoreLookup, 2, 1])).toBe('A'); // Exact match at 90
      expect(vlookup([80, scoreLookup, 2, 1])).toBe('B'); // Exact match at 80
    });

    it('should work with range_lookup = TRUE', () => {
      expect(vlookup([85, scoreLookup, 2, 1])).toBe('B');
    });

    it('should throw error if lookup_value is less than smallest value', () => {
      expect(() => vlookup([-10, scoreLookup, 2, 1])).toThrow(FormulaParseError);
      expect(vlookup([0, scoreLookup, 2, 1])).toBe('F'); // Edge case: exact match at 0
    });

    it('should skip non-numeric values in approximate match mode', () => {
      const mixedTable = to2D([
        [0, 'Zero'],
        ['Text', 'Invalid'],
        [50, 'Fifty'],
        [100, 'Hundred'],
      ]);

      expect(vlookup([75, mixedTable, 2, 1])).toBe('Fifty'); // Skips "Text", finds 50
    });

    it('should skip null/empty cells in approximate match', () => {
      const tableWithNulls = to2D([
        [0, 'Zero'],
        [null, 'Empty'],
        [50, 'Fifty'],
        [100, 'Hundred'],
      ]);

      expect(vlookup([75, tableWithNulls, 2, 1])).toBe('Fifty');
    });

    it('should throw error if result cell is empty in approximate match', () => {
      const tableWithNullResult = to2D([
        [0, 'Zero'],
        [50, null],
        [100, 'Hundred'],
      ]);

      expect(() => vlookup([50, tableWithNullResult, 2, 1])).toThrow(FormulaParseError);
    });
  });

  describe('edge cases', () => {
    it('should handle single-row range', () => {
      const singleRow = to2D([['Product A', 100, 'Category']]);

      expect(vlookup(['Product A', singleRow, 2])).toBe(100);
      expect(vlookup(['Product A', singleRow, 3])).toBe('Category');
    });

    it('should handle single-column range (col_index_num = 1)', () => {
      const singleCol = to2D([['A'], ['B'], ['C']]);

      expect(vlookup(['B', singleCol, 1])).toBe('B');
    });

    it('should handle large ranges', () => {
      const largeRange: (string | number)[][] = [];
      for (let i = 1; i <= 1000; i++) {
        largeRange.push([`Item${i}`, i * 10]);
      }

      expect(vlookup(['Item500', to2D(largeRange), 2])).toBe(5000);
    });

    it('should handle numeric strings in lookup value', () => {
      const numericTable = to2D([
        [1, 'One'],
        [2, 'Two'],
        [3, 'Three'],
      ]);

      // "2" should match 2
      expect(vlookup(['2', numericTable, 2])).toBe('Two');
    });

    it('should handle mixed numeric and string values', () => {
      const mixedTable = to2D([
        ['100', 'String Hundred'],
        [100, 'Number Hundred'],
        ['Product', 'Text Product'],
      ]);

      expect(vlookup([100, mixedTable, 2])).toBe('Number Hundred'); // Numeric match
      expect(vlookup(['100', mixedTable, 2])).toBe('String Hundred'); // String match
      expect(vlookup(['Product', mixedTable, 2])).toBe('Text Product');
    });
  });

  describe('real-world examples', () => {
    it('should work for employee lookup table', () => {
      const employees = to2D([
        ['E001', 'Alice', 'Engineering', 75000],
        ['E002', 'Bob', 'Marketing', 65000],
        ['E003', 'Charlie', 'Engineering', 80000],
        ['E004', 'Diana', 'Sales', 70000],
      ]);

      expect(vlookup(['E001', employees, 2])).toBe('Alice');
      expect(vlookup(['E002', employees, 3])).toBe('Marketing');
      expect(vlookup(['E003', employees, 4])).toBe(80000);
    });

    it('should work for product price lookup', () => {
      const pricelist = to2D([
        ['SKU-001', 'Widget', 19.99],
        ['SKU-002', 'Gadget', 29.99],
        ['SKU-003', 'Doohickey', 39.99],
      ]);

      expect(vlookup(['SKU-002', pricelist, 3])).toBe(29.99);
      expect(vlookup(['SKU-003', pricelist, 2])).toBe('Doohickey');
    });

    it('should work for grade lookup with approximate match', () => {
      const gradeTable = to2D([
        [0, 'F'],
        [60, 'D'],
        [70, 'C'],
        [80, 'B'],
        [90, 'A'],
      ]);

      expect(vlookup([92, gradeTable, 2, 1])).toBe('A');
      expect(vlookup([87, gradeTable, 2, 1])).toBe('B');
      expect(vlookup([73, gradeTable, 2, 1])).toBe('C');
      expect(vlookup([65, gradeTable, 2, 1])).toBe('D');
      expect(vlookup([55, gradeTable, 2, 1])).toBe('F');
    });
  });
});
