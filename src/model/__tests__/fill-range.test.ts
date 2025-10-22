import { describe, it, expect, beforeEach } from 'vitest';
import { Spreadsheet } from '../spreadsheet';
import { CellFormat } from '../../types/core';

describe('Spreadsheet Fill Range', () => {
  let spreadsheet: Spreadsheet;

  beforeEach(() => {
    spreadsheet = new Spreadsheet(20, 10);
  });

  describe('getFillRangeCells', () => {
    it('should return cells for horizontal fill', () => {
      const cells = spreadsheet.getFillRangeCells('A1', 'D1');
      expect(cells).toEqual(['A1', 'B1', 'C1', 'D1']);
    });

    it('should return cells for vertical fill', () => {
      const cells = spreadsheet.getFillRangeCells('A1', 'A4');
      expect(cells).toEqual(['A1', 'A2', 'A3', 'A4']);
    });

    it('should return cells in correct order for reverse horizontal fill', () => {
      const cells = spreadsheet.getFillRangeCells('D1', 'A1');
      expect(cells).toEqual(['A1', 'B1', 'C1', 'D1']);
    });

    it('should return cells in correct order for reverse vertical fill', () => {
      const cells = spreadsheet.getFillRangeCells('A4', 'A1');
      expect(cells).toEqual(['A1', 'A2', 'A3', 'A4']);
    });

    it('should return single cell for same start and end', () => {
      const cells = spreadsheet.getFillRangeCells('B2', 'B2');
      expect(cells).toEqual(['B2']);
    });

    it('should return empty array for diagonal fill', () => {
      const cells = spreadsheet.getFillRangeCells('A1', 'B2');
      expect(cells).toEqual([]);
    });

    it('should return empty array for invalid cell ID', () => {
      const cells = spreadsheet.getFillRangeCells('INVALID', 'A1');
      expect(cells).toEqual([]);
    });
  });

  describe('fillRange', () => {
    it('should fill horizontal range with source cell content', () => {
      spreadsheet.setCellContent('A1', '100');
      const affected = spreadsheet.fillRange('A1', 'D1');

      expect(affected).toEqual(['A1', 'B1', 'C1', 'D1']);
      expect(spreadsheet.getCellContent('A1')).toBe('100');
      expect(spreadsheet.getCellContent('B1')).toBe('100');
      expect(spreadsheet.getCellContent('C1')).toBe('100');
      expect(spreadsheet.getCellContent('D1')).toBe('100');
    });

    it('should translate cell references when filling vertically', () => {
      spreadsheet.setCellContent('A1', '=B1+C1');
      const affected = spreadsheet.fillRange('A1', 'A3');

      expect(affected).toEqual(['A1', 'A2', 'A3']);
      expect(spreadsheet.getCellContent('A1')).toBe('=B1+C1');
      expect(spreadsheet.getCellContent('A2')).toBe('=(B2+C2)');
      expect(spreadsheet.getCellContent('A3')).toBe('=(B3+C3)');
    });

    it('should translate cell references when filling horizontally', () => {
      spreadsheet.setCellContent('A1', '=A2+A3');
      const affected = spreadsheet.fillRange('A1', 'C1');

      expect(affected).toEqual(['A1', 'B1', 'C1']);
      expect(spreadsheet.getCellContent('A1')).toBe('=A2+A3');
      expect(spreadsheet.getCellContent('B1')).toBe('=(B2+B3)');
      expect(spreadsheet.getCellContent('C1')).toBe('=(C2+C3)');
    });

    it('should translate range references when filling', () => {
      spreadsheet.setCellContent('A1', '=SUM(B1:B5)');
      const affected = spreadsheet.fillRange('A1', 'A3');

      expect(affected).toEqual(['A1', 'A2', 'A3']);
      expect(spreadsheet.getCellContent('A1')).toBe('=SUM(B1:B5)');
      expect(spreadsheet.getCellContent('A2')).toBe('=SUM(B2:B6)');
      expect(spreadsheet.getCellContent('A3')).toBe('=SUM(B3:B7)');
    });

    it('should fill range with source cell format', () => {
      spreadsheet.setCellContent('A1', '100');
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      const affected = spreadsheet.fillRange('A1', 'A3');

      expect(affected).toEqual(['A1', 'A2', 'A3']);
      expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Currency);
      expect(spreadsheet.getCellFormat('A2')).toBe(CellFormat.Currency);
      expect(spreadsheet.getCellFormat('A3')).toBe(CellFormat.Currency);
    });

    it('should overwrite existing cell content', () => {
      spreadsheet.setCellContent('A1', 'Source');
      spreadsheet.setCellContent('B1', 'Old');
      spreadsheet.setCellContent('C1', 'Values');

      spreadsheet.fillRange('A1', 'C1');

      expect(spreadsheet.getCellContent('A1')).toBe('Source');
      expect(spreadsheet.getCellContent('B1')).toBe('Source');
      expect(spreadsheet.getCellContent('C1')).toBe('Source');
    });

    it('should overwrite existing cell formats', () => {
      spreadsheet.setCellContent('A1', '100');
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      spreadsheet.setCellFormat('B1', CellFormat.Percentage);
      spreadsheet.setCellFormat('C1', CellFormat.Number);

      spreadsheet.fillRange('A1', 'C1');

      expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Currency);
      expect(spreadsheet.getCellFormat('B1')).toBe(CellFormat.Currency);
      expect(spreadsheet.getCellFormat('C1')).toBe(CellFormat.Currency);
    });

    it('should handle reverse direction fills', () => {
      spreadsheet.setCellContent('D1', 'Test');
      const affected = spreadsheet.fillRange('D1', 'A1');

      expect(affected).toEqual(['A1', 'B1', 'C1', 'D1']);
      expect(spreadsheet.getCellContent('A1')).toBe('Test');
      expect(spreadsheet.getCellContent('B1')).toBe('Test');
      expect(spreadsheet.getCellContent('C1')).toBe('Test');
      expect(spreadsheet.getCellContent('D1')).toBe('Test');
    });

    it('should handle empty source cell', () => {
      spreadsheet.setCellContent('B1', 'Existing');
      const affected = spreadsheet.fillRange('A1', 'C1');

      expect(affected).toEqual(['A1', 'B1', 'C1']);
      expect(spreadsheet.getCellContent('A1')).toBe('');
      expect(spreadsheet.getCellContent('B1')).toBe('');
      expect(spreadsheet.getCellContent('C1')).toBe('');
    });

    it('should return empty array for diagonal fill', () => {
      spreadsheet.setCellContent('A1', 'Test');
      const affected = spreadsheet.fillRange('A1', 'B2');

      expect(affected).toEqual([]);
      // Source cell should remain unchanged
      expect(spreadsheet.getCellContent('A1')).toBe('Test');
      // Target cell should not be filled
      expect(spreadsheet.getCellContent('B2')).toBe('');
    });

    it('should return empty array for invalid cell IDs', () => {
      const affected = spreadsheet.fillRange('INVALID', 'A1');
      expect(affected).toEqual([]);
    });

    it('should fill single cell (same start and end)', () => {
      spreadsheet.setCellContent('B2', 'Value');
      spreadsheet.setCellFormat('B2', CellFormat.Number);
      const affected = spreadsheet.fillRange('B2', 'B2');

      expect(affected).toEqual(['B2']);
      expect(spreadsheet.getCellContent('B2')).toBe('Value');
      expect(spreadsheet.getCellFormat('B2')).toBe(CellFormat.Number);
    });

    it('should handle large ranges', () => {
      spreadsheet.setCellContent('A1', 'Fill');
      const affected = spreadsheet.fillRange('A1', 'J1');

      expect(affected).toHaveLength(10);
      expect(affected).toEqual(['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1']);

      // Verify all cells have the same content
      for (const cellId of affected) {
        expect(spreadsheet.getCellContent(cellId)).toBe('Fill');
      }
    });
  });
});
