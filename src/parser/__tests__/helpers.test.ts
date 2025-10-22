import { describe, it, expect } from 'vitest';
import { expandRange } from '../helpers';
import { columnToNumber, numberToColumn } from '../../utils/column-utils';
import { FormulaParseError } from '../../errors/FormulaParseError';

describe('range-helpers', () => {
  describe('expandRange', () => {
    it('should expand single cell range', () => {
      const cells = expandRange('A1:A1');
      expect(cells).toEqual([['A1']]);
    });

    it('should expand single row range', () => {
      const cells = expandRange('A1:C1');
      expect(cells).toEqual([['A1', 'B1', 'C1']]);
    });

    it('should expand single column range', () => {
      const cells = expandRange('A1:A3');
      expect(cells).toEqual([['A1'], ['A2'], ['A3']]);
    });

    it('should expand rectangular range (row-major order)', () => {
      const cells = expandRange('A1:B2');
      expect(cells).toEqual([
        ['A1', 'B1'], // First row
        ['A2', 'B2'], // Second row
      ]);
    });

    it('should expand larger rectangular range', () => {
      const cells = expandRange('A1:C2');
      expect(cells).toEqual([
        ['A1', 'B1', 'C1'], // First row
        ['A2', 'B2', 'C2'], // Second row
      ]);
    });

    it('should expand 3x3 range', () => {
      const cells = expandRange('A1:C3');
      expect(cells).toEqual([
        ['A1', 'B1', 'C1'], // First row
        ['A2', 'B2', 'C2'], // Second row
        ['A3', 'B3', 'C3'], // Third row
      ]);
    });

    it('should expand range with double-letter columns', () => {
      const cells = expandRange('AA1:AB2');
      expect(cells).toEqual([
        ['AA1', 'AB1'], // First row
        ['AA2', 'AB2'], // Second row
      ]);
    });

    it('should expand range with multi-digit rows', () => {
      const cells = expandRange('A10:B11');
      expect(cells).toEqual([
        ['A10', 'B10'], // First row
        ['A11', 'B11'], // Second row
      ]);
    });

    it('should expand range with both multi-letter columns and multi-digit rows', () => {
      const cells = expandRange('AA10:AB11');
      expect(cells).toEqual([
        ['AA10', 'AB10'], // First row
        ['AA11', 'AB11'], // Second row
      ]);
    });

    it('should expand larger range correctly', () => {
      const cells = expandRange('A1:B5');
      expect(cells).toHaveLength(5); // 5 rows
      expect(cells[0]).toEqual(['A1', 'B1']); // First row
      expect(cells[4]).toEqual(['A5', 'B5']); // Fifth row
      expect(cells[0][0]).toBe('A1'); // First cell
      expect(cells[4][1]).toBe('B5'); // Last cell
    });

    it('should maintain row-major ordering', () => {
      const cells = expandRange('A1:D2');
      expect(cells).toEqual([
        ['A1', 'B1', 'C1', 'D1'], // First row
        ['A2', 'B2', 'C2', 'D2'], // Second row
      ]);
    });
  });

  describe('expandRange error handling', () => {
    it('should handle single cell (no colon) as 1x1 2D array', () => {
      const cells = expandRange('A1');
      expect(cells).toEqual([['A1']]);
    });

    it('should throw on invalid range format (empty start)', () => {
      expect(() => expandRange(':B2')).toThrow(FormulaParseError);
      expect(() => expandRange(':B2')).toThrow('Invalid range start');
    });

    it('should handle empty end part as single cell', () => {
      // When end part is empty after split, it's treated as single cell
      const cells = expandRange('A1:');
      expect(cells).toEqual([['A1']]);
    });

    it('should throw on invalid cell reference in start', () => {
      expect(() => expandRange('1A:B2')).toThrow(FormulaParseError);
      expect(() => expandRange('1A:B2')).toThrow('Invalid range start');
    });

    it('should throw on invalid cell reference in end', () => {
      expect(() => expandRange('A1:2B')).toThrow(FormulaParseError);
      expect(() => expandRange('A1:2B')).toThrow('Invalid range end');
    });

    it('should throw on reversed column range', () => {
      expect(() => expandRange('B1:A1')).toThrow(FormulaParseError);
      expect(() => expandRange('B1:A1')).toThrow('start must be before end');
    });

    it('should throw on reversed row range', () => {
      expect(() => expandRange('A2:A1')).toThrow(FormulaParseError);
      expect(() => expandRange('A2:A1')).toThrow('start must be before end');
    });

    it('should throw on reversed rectangular range', () => {
      expect(() => expandRange('B2:A1')).toThrow(FormulaParseError);
      expect(() => expandRange('B2:A1')).toThrow('start must be before end');
    });

    it('should throw on malformed cell reference', () => {
      expect(() => expandRange('A:B2')).toThrow(FormulaParseError);
      expect(() => expandRange('A1:B')).toThrow(FormulaParseError);
    });

    it('should throw on non-cell reference', () => {
      expect(() => expandRange('FOO:BAR')).toThrow(FormulaParseError);
      expect(() => expandRange('123:456')).toThrow(FormulaParseError);
    });
  });

  describe('integration tests', () => {
    it('should handle real-world spreadsheet ranges', () => {
      // Typical sum range (single column)
      const sumRange = expandRange('A1:A10');
      expect(sumRange).toHaveLength(10); // 10 rows
      expect(sumRange[0]).toEqual(['A1']); // First row
      expect(sumRange[9]).toEqual(['A10']); // Tenth row

      // Typical table range (5x5)
      const tableRange = expandRange('A1:E5');
      expect(tableRange).toHaveLength(5); // 5 rows
      expect(tableRange[0]).toHaveLength(5); // 5 columns per row
      expect(tableRange[0][0]).toBe('A1'); // First cell
      expect(tableRange[4][4]).toBe('E5'); // Last cell

      // Wide range with many columns (single row)
      const wideRange = expandRange('A1:Z1');
      expect(wideRange).toHaveLength(1); // 1 row
      expect(wideRange[0]).toHaveLength(26); // 26 columns
      expect(wideRange[0][0]).toBe('A1'); // First cell
      expect(wideRange[0][25]).toBe('Z1'); // Last cell
    });

    it('should work with columnToNumber and numberToColumn', () => {
      // Parse range manually using utilities
      const range = 'B2:D4';
      const [start, end] = range.split(':');

      const startMatch = start.match(/^([A-Z]+)([0-9]+)$/);
      const endMatch = end.match(/^([A-Z]+)([0-9]+)$/);

      expect(startMatch).toBeTruthy();
      expect(endMatch).toBeTruthy();

      const startCol = columnToNumber(startMatch![1]);
      const endCol = columnToNumber(endMatch![1]);
      const startRow = parseInt(startMatch![2], 10);
      const endRow = parseInt(endMatch![2], 10);

      expect(startCol).toBe(2);
      expect(endCol).toBe(4);
      expect(startRow).toBe(2);
      expect(endRow).toBe(4);

      // Build cells manually in row-major order
      const manualCells: string[][] = [];
      for (let row = startRow; row <= endRow; row++) {
        const rowCells: string[] = [];
        for (let col = startCol; col <= endCol; col++) {
          rowCells.push(`${numberToColumn(col)}${row}`);
        }
        manualCells.push(rowCells);
      }

      // Should match expandRange output
      const expandedCells = expandRange('B2:D4');
      expect(manualCells).toEqual(expandedCells);
    });
  });
});
