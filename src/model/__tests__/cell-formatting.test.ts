import { describe, it, expect, beforeEach } from 'vitest';
import { CellFormat } from '../../types/core';
import { CellResultStore } from '../cell-result-store';
import { Spreadsheet } from '../spreadsheet';

describe('Cell Formatting', () => {
  let spreadsheet: Spreadsheet;
  let cellResultStore: CellResultStore;

  beforeEach(() => {
    spreadsheet = new Spreadsheet(10, 10);
    cellResultStore = new CellResultStore(cellId => spreadsheet.getCellFormat(cellId));
  });

  describe('Raw format', () => {
    it('should display numbers as-is', () => {
      cellResultStore.set('A1', { value: 12345, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('12345');
    });

    it('should display strings as-is', () => {
      cellResultStore.set('A1', { value: 'hello', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('hello');
    });

    it('should display timestamps as raw numbers', () => {
      const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
      cellResultStore.set('A1', { value: timestamp, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe(String(timestamp));
    });
  });

  describe('Date format', () => {
    it('should format timestamps as mm/dd/yyyy', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
      cellResultStore.set('A1', { value: timestamp, error: null });

      // Note: The exact date depends on timezone, so we just check format
      const displayValue = cellResultStore.getDisplayValue('A1');
      expect(displayValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should format DATE() function results', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      const date = new Date(2024, 2, 15).getTime(); // March 15, 2024
      cellResultStore.set('A1', { value: date, error: null });

      expect(cellResultStore.getDisplayValue('A1')).toBe('03/15/2024');
    });

    it('should format TODAY() function results', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      cellResultStore.set('A1', { value: today.getTime(), error: null });

      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      expect(cellResultStore.getDisplayValue('A1')).toBe(`${month}/${day}/${year}`);
    });

    it('should fall back to Raw for non-numeric values', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      cellResultStore.set('A1', { value: 'not a number', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('not a number');
    });

    it('should fall back to Raw for invalid dates', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      cellResultStore.set('A1', { value: NaN, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('NaN');
    });
  });

  describe('Format persistence', () => {
    it('should save and restore cell formats', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      spreadsheet.setCellFormat('B1', CellFormat.Raw);

      expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Date);
      expect(spreadsheet.getCellFormat('B1')).toBe(CellFormat.Raw);
      expect(spreadsheet.getCellFormat('C1')).toBe(CellFormat.Raw); // Default
    });

    it('should include formats in exported state', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      spreadsheet.setCellFormat('B2', CellFormat.Date);

      const state = spreadsheet.exportState();
      expect(state.cellFormats).toEqual([
        ['A1', CellFormat.Date],
        ['B2', CellFormat.Date],
      ]);
    });

    it('should restore formats from imported state', () => {
      const state = {
        cells: {},
        columnWidths: [] as Array<[number, number]>,
        rowHeights: [] as Array<[number, number]>,
        cellFormats: [
          ['A1', CellFormat.Date],
          ['C3', CellFormat.Date],
        ] as Array<[string, CellFormat]>,
        selectedCell: 'A1' as string | null,
      };

      spreadsheet.importState(state);

      expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Date);
      expect(spreadsheet.getCellFormat('C3')).toBe(CellFormat.Date);
      expect(spreadsheet.getCellFormat('B2')).toBe(CellFormat.Raw); // Default
    });

    it('should clear formats when spreadsheet is cleared', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      spreadsheet.setCellFormat('B2', CellFormat.Date);

      spreadsheet.clear();

      expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Raw);
      expect(spreadsheet.getCellFormat('B2')).toBe(CellFormat.Raw);
    });
  });

  describe('Number format', () => {
    it('should format numbers with thousands separator and 2 decimals', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      cellResultStore.set('A1', { value: 1234567.89, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('1,234,567.89');
    });

    it('should add .00 for whole numbers', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      cellResultStore.set('A1', { value: 1234, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('1,234.00');
    });

    it('should round to 2 decimal places', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      cellResultStore.set('A1', { value: 1234.5678, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('1,234.57');
    });

    it('should handle negative numbers', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      cellResultStore.set('A1', { value: -1234.56, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('-1,234.56');
    });

    it('should fall back to Raw for non-numeric values', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      cellResultStore.set('A1', { value: 'not a number', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('not a number');
    });
  });

  describe('Currency format', () => {
    it('should format numbers as USD currency', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      cellResultStore.set('A1', { value: 1234.56, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('$1,234.56');
    });

    it('should handle negative amounts', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      cellResultStore.set('A1', { value: -1234.56, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('-$1,234.56');
    });

    it('should add .00 for whole numbers', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      cellResultStore.set('A1', { value: 100, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('$100.00');
    });

    it('should handle zero', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      cellResultStore.set('A1', { value: 0, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('$0.00');
    });

    it('should fall back to Raw for non-numeric values', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Currency);
      cellResultStore.set('A1', { value: 'not a number', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('not a number');
    });
  });

  describe('Percentage format', () => {
    it('should multiply by 100 and add % sign', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: 0.75, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('75.00%');
    });

    it('should handle whole numbers', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: 1, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('100.00%');
    });

    it('should handle values greater than 1', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: 2.5, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('250.00%');
    });

    it('should handle negative percentages', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: -0.25, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('-25.00%');
    });

    it('should round to 2 decimal places', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: 0.12345, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('12.35%');
    });

    it('should fall back to Raw for non-numeric values', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Percentage);
      cellResultStore.set('A1', { value: 'not a number', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('not a number');
    });
  });

  describe('Time format', () => {
    it('should format timestamps as 12-hour time', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      // Create a timestamp for 2:30:45 PM
      const date = new Date(2024, 0, 1, 14, 30, 45);
      cellResultStore.set('A1', { value: date.getTime(), error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('2:30:45 PM');
    });

    it('should handle midnight', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      const date = new Date(2024, 0, 1, 0, 0, 0);
      cellResultStore.set('A1', { value: date.getTime(), error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('12:00:00 AM');
    });

    it('should handle noon', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      const date = new Date(2024, 0, 1, 12, 0, 0);
      cellResultStore.set('A1', { value: date.getTime(), error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('12:00:00 PM');
    });

    it('should work with NOW() function results', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      const now = new Date();
      cellResultStore.set('A1', { value: now.getTime(), error: null });

      // Just check that it has the right format
      const displayValue = cellResultStore.getDisplayValue('A1');
      expect(displayValue).toMatch(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/);
    });

    it('should fall back to Raw for non-numeric values', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      cellResultStore.set('A1', { value: 'not a number', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('not a number');
    });

    it('should fall back to Raw for invalid dates', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Time);
      cellResultStore.set('A1', { value: NaN, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('NaN');
    });
  });

  describe('Boolean format', () => {
    it('should format 1 as True', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: 1, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('True');
    });

    it('should format 0 as False', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: 0, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('False');
    });

    it('should format string "1" as True', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: '1', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('True');
    });

    it('should format string "0" as False', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: '0', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('False');
    });

    it('should fall back to Raw for other numbers', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: 5, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('5');
    });

    it('should fall back to Raw for non-boolean strings', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      cellResultStore.set('A1', { value: 'hello', error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('hello');
    });

    it('should work with comparison operator results', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Boolean);
      // Comparison operators return 1 for true, 0 for false
      cellResultStore.set('A1', { value: 1, error: null });
      expect(cellResultStore.getDisplayValue('A1')).toBe('True');
    });
  });

  describe('Error handling', () => {
    it('should display #ERROR for cells with errors regardless of format', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      cellResultStore.set('A1', { value: null, error: 'Division by zero' });

      expect(cellResultStore.getDisplayValue('A1')).toBe('#ERROR');
    });

    it('should display empty string for cells with no result', () => {
      spreadsheet.setCellFormat('A1', CellFormat.Date);
      expect(cellResultStore.getDisplayValue('A1')).toBe('');
    });
  });
});
