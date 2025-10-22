import { describe, it, expect, beforeEach } from 'vitest';
import { Spreadsheet } from '../spreadsheet';
import { CellFormat } from '../../types/core';

describe('Spreadsheet', () => {
  let spreadsheet: Spreadsheet;

  beforeEach(() => {
    spreadsheet = new Spreadsheet(10, 10);
  });

  describe('constructor', () => {
    it('should create spreadsheet with specified dimensions', () => {
      expect(spreadsheet.rows).toBe(10);
      expect(spreadsheet.cols).toBe(10);
    });

    it('should initialize with empty cells', () => {
      const allCells = spreadsheet.getAllCells();
      expect(Object.keys(allCells).length).toBe(0);
    });
  });

  describe('columnIndexToLetter', () => {
    it('should convert 0 to A', () => {
      expect(spreadsheet.columnIndexToLetter(0)).toBe('A');
    });

    it('should convert 1 to B', () => {
      expect(spreadsheet.columnIndexToLetter(1)).toBe('B');
    });

    it('should convert 25 to Z', () => {
      expect(spreadsheet.columnIndexToLetter(25)).toBe('Z');
    });

    it('should convert 26 to AA', () => {
      expect(spreadsheet.columnIndexToLetter(26)).toBe('AA');
    });

    it('should convert 27 to AB', () => {
      expect(spreadsheet.columnIndexToLetter(27)).toBe('AB');
    });

    it('should convert 51 to AZ', () => {
      expect(spreadsheet.columnIndexToLetter(51)).toBe('AZ');
    });

    it('should convert 52 to BA', () => {
      expect(spreadsheet.columnIndexToLetter(52)).toBe('BA');
    });

    it('should convert 701 to ZZ', () => {
      expect(spreadsheet.columnIndexToLetter(701)).toBe('ZZ');
    });
  });

  describe('getCellId', () => {
    it('should convert row 0, col 0 to A1', () => {
      expect(spreadsheet.getCellId(0, 0)).toBe('A1');
    });

    it('should convert row 0, col 1 to B1', () => {
      expect(spreadsheet.getCellId(0, 1)).toBe('B1');
    });

    it('should convert row 1, col 0 to A2', () => {
      expect(spreadsheet.getCellId(1, 0)).toBe('A2');
    });

    it('should handle double-letter columns', () => {
      expect(spreadsheet.getCellId(9, 26)).toBe('AA10');
    });

    it('should handle large indices', () => {
      expect(spreadsheet.getCellId(99, 51)).toBe('AZ100');
    });
  });

  describe('parseCellId', () => {
    it('should parse A1', () => {
      const result = spreadsheet.parseCellId('A1');
      expect(result).toEqual({ row: 0, col: 0 });
    });

    it('should parse B1', () => {
      const result = spreadsheet.parseCellId('B1');
      expect(result).toEqual({ row: 0, col: 1 });
    });

    it('should parse A2', () => {
      const result = spreadsheet.parseCellId('A2');
      expect(result).toEqual({ row: 1, col: 0 });
    });

    it('should parse Z1', () => {
      const result = spreadsheet.parseCellId('Z1');
      expect(result).toEqual({ row: 0, col: 25 });
    });

    it('should parse AA1', () => {
      const result = spreadsheet.parseCellId('AA1');
      expect(result).toEqual({ row: 0, col: 26 });
    });

    it('should parse AB10', () => {
      const result = spreadsheet.parseCellId('AB10');
      expect(result).toEqual({ row: 9, col: 27 });
    });

    it('should parse AZ100', () => {
      const result = spreadsheet.parseCellId('AZ100');
      expect(result).toEqual({ row: 99, col: 51 });
    });

    it('should return null for invalid cell ID', () => {
      expect(spreadsheet.parseCellId('123')).toBeNull();
      expect(spreadsheet.parseCellId('ABC')).toBeNull();
      expect(spreadsheet.parseCellId('A')).toBeNull();
      expect(spreadsheet.parseCellId('1A')).toBeNull();
    });
  });

  describe('getCellContent and setCellContent', () => {
    it('should return empty string for unset cell', () => {
      expect(spreadsheet.getCellContent('A1')).toBe('');
    });

    it('should store and retrieve cell content', () => {
      spreadsheet.setCellContent('A1', '42');
      expect(spreadsheet.getCellContent('A1')).toBe('42');
    });

    it('should store and retrieve formula content', () => {
      spreadsheet.setCellContent('A1', '=SUM(B1, C1)');
      expect(spreadsheet.getCellContent('A1')).toBe('=SUM(B1, C1)');
    });

    it('should overwrite existing content', () => {
      spreadsheet.setCellContent('A1', 'first');
      spreadsheet.setCellContent('A1', 'second');
      expect(spreadsheet.getCellContent('A1')).toBe('second');
    });

    it('should handle multiple cells independently', () => {
      spreadsheet.setCellContent('A1', '10');
      spreadsheet.setCellContent('B1', '20');
      spreadsheet.setCellContent('C1', '30');

      expect(spreadsheet.getCellContent('A1')).toBe('10');
      expect(spreadsheet.getCellContent('B1')).toBe('20');
      expect(spreadsheet.getCellContent('C1')).toBe('30');
    });
  });

  describe('selectCell and getSelectedCell', () => {
    it('should start with no selected cell', () => {
      expect(spreadsheet.getSelectedCell()).toBeNull();
    });

    it('should select a cell', () => {
      spreadsheet.selectCell('A1');
      expect(spreadsheet.getSelectedCell()).toBe('A1');
    });

    it('should change selected cell', () => {
      spreadsheet.selectCell('A1');
      spreadsheet.selectCell('B2');
      expect(spreadsheet.getSelectedCell()).toBe('B2');
    });
  });

  describe('navigateUp', () => {
    it('should return null when no cell is selected', () => {
      expect(spreadsheet.navigateUp()).toBeNull();
    });

    it('should move up from A2 to A1', () => {
      spreadsheet.selectCell('A2');
      expect(spreadsheet.navigateUp()).toBe('A1');
    });

    it('should return null when already at top row', () => {
      spreadsheet.selectCell('A1');
      expect(spreadsheet.navigateUp()).toBeNull();
    });

    it('should work with multi-letter columns', () => {
      spreadsheet.selectCell('AA5');
      expect(spreadsheet.navigateUp()).toBe('AA4');
    });
  });

  describe('navigateDown', () => {
    it('should return null when no cell is selected', () => {
      expect(spreadsheet.navigateDown()).toBeNull();
    });

    it('should move down from A1 to A2', () => {
      spreadsheet.selectCell('A1');
      expect(spreadsheet.navigateDown()).toBe('A2');
    });

    it('should return null when at bottom row', () => {
      spreadsheet.selectCell('A10');
      expect(spreadsheet.navigateDown()).toBeNull();
    });

    it('should work with multi-letter columns', () => {
      spreadsheet.selectCell('AA5');
      expect(spreadsheet.navigateDown()).toBe('AA6');
    });
  });

  describe('navigateLeft', () => {
    it('should return null when no cell is selected', () => {
      expect(spreadsheet.navigateLeft()).toBeNull();
    });

    it('should move left from B1 to A1', () => {
      spreadsheet.selectCell('B1');
      expect(spreadsheet.navigateLeft()).toBe('A1');
    });

    it('should return null when already at leftmost column', () => {
      spreadsheet.selectCell('A1');
      expect(spreadsheet.navigateLeft()).toBeNull();
    });

    it('should work with multi-letter columns', () => {
      spreadsheet.selectCell('AA5');
      expect(spreadsheet.navigateLeft()).toBe('Z5');
    });
  });

  describe('navigateRight', () => {
    it('should return null when no cell is selected', () => {
      expect(spreadsheet.navigateRight()).toBeNull();
    });

    it('should move right from A1 to B1', () => {
      spreadsheet.selectCell('A1');
      expect(spreadsheet.navigateRight()).toBe('B1');
    });

    it('should return null when at rightmost column', () => {
      spreadsheet.selectCell('J1');
      expect(spreadsheet.navigateRight()).toBeNull();
    });

    it('should work with multi-letter columns', () => {
      const largeSpreadsheet = new Spreadsheet(10, 30);
      largeSpreadsheet.selectCell('Z5');
      expect(largeSpreadsheet.navigateRight()).toBe('AA5');
    });
  });

  describe('getAllCells', () => {
    it('should return empty object when no cells are set', () => {
      const cells = spreadsheet.getAllCells();
      expect(cells).toEqual({});
    });

    it('should return all cells that have been set', () => {
      spreadsheet.setCellContent('A1', '10');
      spreadsheet.setCellContent('B2', '20');
      spreadsheet.setCellContent('C3', '=A1+B2');

      const cells = spreadsheet.getAllCells();
      expect(Object.keys(cells).length).toBe(3);
      expect(cells['A1']).toEqual({ content: '10' });
      expect(cells['B2']).toEqual({ content: '20' });
      expect(cells['C3']).toEqual({ content: '=A1+B2' });
    });

    it('should return a copy of cells object', () => {
      spreadsheet.setCellContent('A1', '10');
      spreadsheet.setCellContent('B1', '20');

      const cells = spreadsheet.getAllCells();

      // Modifying the returned object should not affect internal state
      delete cells['A1'];

      // Original cells should still be intact
      expect(spreadsheet.getCellContent('A1')).toBe('10');
      expect(spreadsheet.getCellContent('B1')).toBe('20');
    });
  });

  describe('navigation integration', () => {
    it('should navigate in all directions from center', () => {
      spreadsheet.selectCell('B2');

      expect(spreadsheet.navigateUp()).toBe('B1');
      expect(spreadsheet.navigateDown()).toBe('B3');
      expect(spreadsheet.navigateLeft()).toBe('A2');
      expect(spreadsheet.navigateRight()).toBe('C2');
    });

    it('should handle corner navigation correctly', () => {
      spreadsheet.selectCell('A1');

      expect(spreadsheet.navigateUp()).toBeNull();
      expect(spreadsheet.navigateLeft()).toBeNull();
      expect(spreadsheet.navigateDown()).toBe('A2');
      expect(spreadsheet.navigateRight()).toBe('B1');
    });

    it('should handle bottom-right corner', () => {
      spreadsheet.selectCell('J10');

      expect(spreadsheet.navigateDown()).toBeNull();
      expect(spreadsheet.navigateRight()).toBeNull();
      expect(spreadsheet.navigateUp()).toBe('J9');
      expect(spreadsheet.navigateLeft()).toBe('I10');
    });
  });

  describe('round-trip conversions', () => {
    it('should convert indices to cell ID and back', () => {
      const cellId = spreadsheet.getCellId(5, 7);
      const parsed = spreadsheet.parseCellId(cellId);

      expect(parsed).toEqual({ row: 5, col: 7 });
    });

    it('should work for various indices', () => {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 30; col++) {
          const cellId = spreadsheet.getCellId(row, col);
          const parsed = spreadsheet.parseCellId(cellId);

          expect(parsed).toEqual({ row, col });
        }
      }
    });
  });

  describe('copy/paste functionality', () => {
    beforeEach(() => {
      spreadsheet.setCellContent('A1', '42');
      spreadsheet.setCellFormat('A1', CellFormat.Number);
      spreadsheet.selectCell('A1');
    });

    describe('copyCell', () => {
      it('should copy the selected cell content and format', () => {
        spreadsheet.copyCell();
        expect(spreadsheet.getCopiedCell()).toBe('A1');
      });

      it('should capture content at the moment of copying', () => {
        spreadsheet.copyCell();

        // Change the original cell after copying
        spreadsheet.setCellContent('A1', '100');

        // Paste should use the old value (42), not the new value (100)
        spreadsheet.selectCell('B1');
        spreadsheet.pasteCell();
        expect(spreadsheet.getCellContent('B1')).toBe('42');
      });

      it('should not copy if no cell is selected', () => {
        const emptySpreadsheet = new Spreadsheet(10, 10);
        emptySpreadsheet.copyCell();
        expect(emptySpreadsheet.getCopiedCell()).toBeNull();
      });

      it('should preserve format when copying', () => {
        spreadsheet.copyCell();
        spreadsheet.selectCell('B1');
        spreadsheet.pasteCell();
        expect(spreadsheet.getCellFormat('B1')).toBe(CellFormat.Number);
      });
    });

    describe('cutCell', () => {
      it('should copy the cell and clear the original', () => {
        spreadsheet.cutCell();

        expect(spreadsheet.getCopiedCell()).toBe('A1');
        expect(spreadsheet.getCellContent('A1')).toBe('');
        expect(spreadsheet.getCellFormat('A1')).toBe(CellFormat.Raw);
      });

      it('should allow pasting after cut', () => {
        spreadsheet.cutCell();
        spreadsheet.selectCell('B1');
        const result = spreadsheet.pasteCell();

        expect(result).toBe(true);
        expect(spreadsheet.getCellContent('B1')).toBe('42');
        expect(spreadsheet.getCellFormat('B1')).toBe(CellFormat.Number);
      });

      it('should not cut if no cell is selected', () => {
        const emptySpreadsheet = new Spreadsheet(10, 10);
        emptySpreadsheet.cutCell();
        expect(emptySpreadsheet.getCopiedCell()).toBeNull();
      });
    });

    describe('pasteCell', () => {
      it('should paste copied content to selected cell', () => {
        spreadsheet.copyCell();
        spreadsheet.selectCell('B1');
        const result = spreadsheet.pasteCell();

        expect(result).toBe(true);
        expect(spreadsheet.getCellContent('B1')).toBe('42');
        expect(spreadsheet.getCellFormat('B1')).toBe(CellFormat.Number);
      });

      it('should return false if clipboard is empty', () => {
        spreadsheet.selectCell('B1');
        const result = spreadsheet.pasteCell();
        expect(result).toBe(false);
      });

      it('should return false if no cell is selected', () => {
        spreadsheet.copyCell();
        const emptySpreadsheet = new Spreadsheet(10, 10);
        const result = emptySpreadsheet.pasteCell();
        expect(result).toBe(false);
      });

      it('should overwrite existing cell content', () => {
        spreadsheet.setCellContent('B1', 'original');
        spreadsheet.copyCell();
        spreadsheet.selectCell('B1');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('B1')).toBe('42');
      });

      it('should allow pasting multiple times', () => {
        spreadsheet.copyCell();

        spreadsheet.selectCell('B1');
        spreadsheet.pasteCell();

        spreadsheet.selectCell('C1');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('B1')).toBe('42');
        expect(spreadsheet.getCellContent('C1')).toBe('42');
      });

      it('should translate cell references when pasting formula down', () => {
        spreadsheet.setCellContent('A1', '=B1+C1');
        spreadsheet.selectCell('A1');
        spreadsheet.copyCell();
        spreadsheet.selectCell('A2');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('A2')).toBe('=(B2+C2)');
      });

      it('should translate cell references when pasting formula right', () => {
        spreadsheet.setCellContent('A1', '=A2+A3');
        spreadsheet.selectCell('A1');
        spreadsheet.copyCell();
        spreadsheet.selectCell('B1');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('B1')).toBe('=(B2+B3)');
      });

      it('should translate range references when pasting', () => {
        spreadsheet.setCellContent('A1', '=SUM(B1:B3)');
        spreadsheet.selectCell('A1');
        spreadsheet.copyCell();
        spreadsheet.selectCell('A2');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('A2')).toBe('=SUM(B2:B4)');
      });

      it('should handle non-formula content without translation', () => {
        spreadsheet.setCellContent('A1', '42');
        spreadsheet.selectCell('A1');
        spreadsheet.copyCell();
        spreadsheet.selectCell('A2');
        spreadsheet.pasteCell();

        expect(spreadsheet.getCellContent('A2')).toBe('42');
      });
    });

    describe('getCopiedCell', () => {
      it('should return null initially', () => {
        const emptySpreadsheet = new Spreadsheet(10, 10);
        expect(emptySpreadsheet.getCopiedCell()).toBeNull();
      });

      it('should return the copied cell ID', () => {
        spreadsheet.copyCell();
        expect(spreadsheet.getCopiedCell()).toBe('A1');
      });

      it('should return null after clearing clipboard', () => {
        spreadsheet.copyCell();
        spreadsheet.clearClipboard();
        expect(spreadsheet.getCopiedCell()).toBeNull();
      });
    });

    describe('clearClipboard', () => {
      it('should clear the clipboard', () => {
        spreadsheet.copyCell();
        spreadsheet.clearClipboard();

        expect(spreadsheet.getCopiedCell()).toBeNull();
        spreadsheet.selectCell('B1');
        const result = spreadsheet.pasteCell();
        expect(result).toBe(false);
      });

      it('should be safe to call multiple times', () => {
        spreadsheet.copyCell();
        spreadsheet.clearClipboard();
        spreadsheet.clearClipboard();
        expect(spreadsheet.getCopiedCell()).toBeNull();
      });

      it('should be safe to call when clipboard is empty', () => {
        expect(() => spreadsheet.clearClipboard()).not.toThrow();
      });
    });

    describe('clear', () => {
      it('should clear clipboard when clearing spreadsheet', () => {
        spreadsheet.copyCell();
        spreadsheet.clear();
        expect(spreadsheet.getCopiedCell()).toBeNull();
      });
    });
  });
});
