import { describe, it, expect } from 'vitest';
import { expandRange } from '../range-helpers';
import { columnToNumber, numberToColumn } from '../column-utils';
import { FormulaParseError } from '../../errors/FormulaParseError';

describe('range-helpers', () => {
  describe('expandRange', () => {
    it('should expand single cell range', () => {
      const cells = expandRange('A1:A1');
      expect(cells).toEqual(['A1']);
    });

    it('should expand single row range', () => {
      const cells = expandRange('A1:C1');
      expect(cells).toEqual(['A1', 'B1', 'C1']);
    });

    it('should expand single column range', () => {
      const cells = expandRange('A1:A3');
      expect(cells).toEqual(['A1', 'A2', 'A3']);
    });

    it('should expand rectangular range (column-by-column)', () => {
      const cells = expandRange('A1:B2');
      expect(cells).toEqual(['A1', 'A2', 'B1', 'B2']);
    });

    it('should expand larger rectangular range', () => {
      const cells = expandRange('A1:C2');
      expect(cells).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    });

    it('should expand 3x3 range', () => {
      const cells = expandRange('A1:C3');
      expect(cells).toEqual([
        'A1', 'A2', 'A3',
        'B1', 'B2', 'B3',
        'C1', 'C2', 'C3',
      ]);
    });

    it('should expand range with double-letter columns', () => {
      const cells = expandRange('AA1:AB2');
      expect(cells).toEqual(['AA1', 'AA2', 'AB1', 'AB2']);
    });

    it('should expand range with multi-digit rows', () => {
      const cells = expandRange('A10:B11');
      expect(cells).toEqual(['A10', 'A11', 'B10', 'B11']);
    });

    it('should expand range with both multi-letter columns and multi-digit rows', () => {
      const cells = expandRange('AA10:AB11');
      expect(cells).toEqual(['AA10', 'AA11', 'AB10', 'AB11']);
    });

    it('should expand larger range correctly', () => {
      const cells = expandRange('A1:B5');
      expect(cells).toHaveLength(10);
      expect(cells[0]).toBe('A1');
      expect(cells[4]).toBe('A5');
      expect(cells[5]).toBe('B1');
      expect(cells[9]).toBe('B5');
    });

    it('should maintain column-by-column ordering', () => {
      const cells = expandRange('A1:D2');
      expect(cells).toEqual([
        'A1', 'A2', // First column
        'B1', 'B2', // Second column
        'C1', 'C2', // Third column
        'D1', 'D2', // Fourth column
      ]);
    });
  });

  describe('expandRange error handling', () => {
    it('should throw on invalid range format (missing colon)', () => {
      expect(() => expandRange('A1')).toThrow(FormulaParseError);
      expect(() => expandRange('A1')).toThrow('Invalid range: A1');
    });

    it('should throw on invalid range format (empty parts)', () => {
      expect(() => expandRange(':B2')).toThrow(FormulaParseError);
      expect(() => expandRange('A1:')).toThrow(FormulaParseError);
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
      // Typical sum range
      const sumRange = expandRange('A1:A10');
      expect(sumRange).toHaveLength(10);
      expect(sumRange[0]).toBe('A1');
      expect(sumRange[9]).toBe('A10');

      // Typical table range
      const tableRange = expandRange('A1:E5');
      expect(tableRange).toHaveLength(25);
      expect(tableRange[0]).toBe('A1');
      expect(tableRange[24]).toBe('E5');

      // Wide range with many columns
      const wideRange = expandRange('A1:Z1');
      expect(wideRange).toHaveLength(26);
      expect(wideRange[0]).toBe('A1');
      expect(wideRange[25]).toBe('Z1');
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

      // Build cells manually
      const manualCells: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          manualCells.push(`${numberToColumn(col)}${row}`);
        }
      }

      // Should match expandRange output
      const expandedCells = expandRange('B2:D4');
      expect(manualCells).toEqual(expandedCells);
    });
  });
});
