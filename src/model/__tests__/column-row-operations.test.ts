import { describe, expect, it } from 'vitest';
import { CellFormat } from '../../types/core';
import { Spreadsheet } from '../spreadsheet';

describe('Column/Row Operations', () => {
  describe('insertColumnLeft', () => {
    it('should include newly inserted empty cells in affected cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');

      const affectedCells = sheet.insertColumnLeft(1); // Insert left of B

      // The newly inserted column B cells should be in affected cells
      expect(affectedCells).toContain('B1');
      expect(affectedCells).toContain('B2');
      expect(affectedCells).toContain('B3');
      expect(affectedCells).toContain('B4');
      expect(affectedCells).toContain('B5');

      // The newly inserted cells should be empty
      expect(sheet.getCellContent('B1')).toBe('');
      expect(sheet.getCellContent('B2')).toBe('');
    });

    it('should NOT shift references to columns before the insertion point', () => {
      const sheet = new Spreadsheet(10, 10);
      // Setup: A1-A5 have values 1-5, B1-B5 have formulas =A1+1 to =A5+1
      sheet.setCellContent('A1', '1');
      sheet.setCellContent('A2', '2');
      sheet.setCellContent('A3', '3');
      sheet.setCellContent('A4', '4');
      sheet.setCellContent('A5', '5');
      sheet.setCellContent('B1', '=A1+1');
      sheet.setCellContent('B2', '=A2+1');
      sheet.setCellContent('B3', '=A3+1');
      sheet.setCellContent('B4', '=A4+1');
      sheet.setCellContent('B5', '=A5+1');

      // Insert column left of B (at index 1)
      sheet.insertColumnLeft(1);

      // Column A should be unchanged
      expect(sheet.getCellContent('A1')).toBe('1');
      expect(sheet.getCellContent('A2')).toBe('2');
      expect(sheet.getCellContent('A3')).toBe('3');
      expect(sheet.getCellContent('A4')).toBe('4');
      expect(sheet.getCellContent('A5')).toBe('5');

      // Column B should now be empty (newly inserted)
      expect(sheet.getCellContent('B1')).toBe('');
      expect(sheet.getCellContent('B2')).toBe('');
      expect(sheet.getCellContent('B3')).toBe('');
      expect(sheet.getCellContent('B4')).toBe('');
      expect(sheet.getCellContent('B5')).toBe('');

      // Column C should have the old B formulas, but references to A should NOT be shifted
      // because A is BEFORE the insertion point
      expect(sheet.getCellContent('C1')).toBe('=A1+1');
      expect(sheet.getCellContent('C2')).toBe('=A2+1');
      expect(sheet.getCellContent('C3')).toBe('=A3+1');
      expect(sheet.getCellContent('C4')).toBe('=A4+1');
      expect(sheet.getCellContent('C5')).toBe('=A5+1');
    });

    it('should insert a new empty column to the left', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');

      const affectedCells = sheet.insertColumnLeft(1); // Insert left of B

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 should now be empty (new column)
      expect(sheet.getCellContent('B1')).toBe('');
      // Old B1 should move to C1
      expect(sheet.getCellContent('C1')).toBe('20');
      // Old C1 should move to D1
      expect(sheet.getCellContent('D1')).toBe('30');

      // Should return affected cells
      expect(affectedCells.length).toBeGreaterThan(0);
    });

    it('should translate formulas when shifting cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '=A1*2');
      sheet.setCellContent('C1', '=B1+5');

      sheet.insertColumnLeft(1); // Insert left of B

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 is now empty (new column)
      expect(sheet.getCellContent('B1')).toBe('');
      // Old B1 moved to C1
      // Reference to A1 stays unchanged (A is before insertion point)
      expect(sheet.getCellContent('C1')).toBe('=A1*2');
      // Old C1 moved to D1
      // Reference to B1 becomes C1 (B is at insertion point, shifts to C)
      expect(sheet.getCellContent('D1')).toBe('=C1+5');
    });

    it('should preserve column widths when inserting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 200);

      sheet.insertColumnLeft(1); // Insert left of B

      // Column 0 (A) should have default width
      expect(sheet.getColumnWidth(0)).toBe(100);
      // New column at index 1 should have default width
      expect(sheet.getColumnWidth(1)).toBe(100);
      // Old column 1 width should shift to column 2
      expect(sheet.getColumnWidth(2)).toBe(150);
      // Old column 2 width should shift to column 3
      expect(sheet.getColumnWidth(3)).toBe(200);
    });

    it('should preserve cell formats when inserting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '1234.56');
      sheet.setCellFormat('A1', CellFormat.Number);
      sheet.setCellContent('B1', '9876.54');
      sheet.setCellFormat('B1', CellFormat.Currency);

      sheet.insertColumnLeft(1); // Insert left of B

      // A1 format should stay the same
      expect(sheet.getCellFormat('A1')).toBe(CellFormat.Number);
      // B1 should have default format (new column)
      expect(sheet.getCellFormat('B1')).toBe(CellFormat.Raw);
      // Old B1 format should move to C1
      expect(sheet.getCellFormat('C1')).toBe(CellFormat.Currency);
    });

    it('should handle inserting at column 0', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');

      sheet.insertColumnLeft(0); // Insert left of A

      // A1 should now be empty
      expect(sheet.getCellContent('A1')).toBe('');
      // Old A1 should move to B1
      expect(sheet.getCellContent('B1')).toBe('10');
      // Old B1 should move to C1
      expect(sheet.getCellContent('C1')).toBe('20');
    });

    it('should return empty array for invalid column index', () => {
      const sheet = new Spreadsheet(5, 5);
      expect(sheet.insertColumnLeft(-1)).toEqual([]);
      expect(sheet.insertColumnLeft(10)).toEqual([]);
    });
  });

  describe('insertColumnRight', () => {
    it('should insert a new empty column to the right', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');

      sheet.insertColumnRight(0); // Insert right of A

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 should now be empty (new column)
      expect(sheet.getCellContent('B1')).toBe('');
      // Old B1 should move to C1
      expect(sheet.getCellContent('C1')).toBe('20');
      // Old C1 should move to D1
      expect(sheet.getCellContent('D1')).toBe('30');
    });

    it('should translate formulas when shifting cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '=A1*2');

      sheet.insertColumnRight(0); // Insert right of A (inserts at index 1, which is B)

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 is now empty (new column)
      expect(sheet.getCellContent('B1')).toBe('');
      // Old B1 moved to C1
      // Reference to A1 stays unchanged (A is before insertion point at index 1)
      expect(sheet.getCellContent('C1')).toBe('=A1*2');
    });
  });

  describe('insertRowAbove', () => {
    it('should include newly inserted empty cells in affected cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');

      const affectedCells = sheet.insertRowAbove(1); // Insert above row 2

      // The newly inserted row 2 cells should be in affected cells
      expect(affectedCells).toContain('A2');
      expect(affectedCells).toContain('B2');
      expect(affectedCells).toContain('C2');
      expect(affectedCells).toContain('D2');
      expect(affectedCells).toContain('E2');

      // The newly inserted cells should be empty
      expect(sheet.getCellContent('A2')).toBe('');
      expect(sheet.getCellContent('B2')).toBe('');
    });

    it('should insert a new empty row above', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');

      const affectedCells = sheet.insertRowAbove(1); // Insert above row 2

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 should now be empty (new row)
      expect(sheet.getCellContent('A2')).toBe('');
      // Old A2 should move to A3
      expect(sheet.getCellContent('A3')).toBe('20');
      // Old A3 should move to A4
      expect(sheet.getCellContent('A4')).toBe('30');

      // Should return affected cells
      expect(affectedCells.length).toBeGreaterThan(0);
    });

    it('should translate formulas when shifting cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '=A1*2');
      sheet.setCellContent('A3', '=A2+5');

      sheet.insertRowAbove(1); // Insert above row 2 (at index 1)

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 is now empty (new row)
      expect(sheet.getCellContent('A2')).toBe('');
      // Old A2 moved to A3
      // Reference to A1 stays unchanged (A1 is before insertion point)
      expect(sheet.getCellContent('A3')).toBe('=A1*2');
      // Old A3 moved to A4
      // Reference to A2 becomes A3 (A2 is at insertion point, shifts to A3)
      expect(sheet.getCellContent('A4')).toBe('=A3+5');
    });

    it('should preserve row heights when inserting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setRowHeight(1, 50);
      sheet.setRowHeight(2, 60);

      sheet.insertRowAbove(1); // Insert above row 2

      // Row 0 should have default height
      expect(sheet.getRowHeight(0)).toBe(32);
      // New row at index 1 should have default height
      expect(sheet.getRowHeight(1)).toBe(32);
      // Old row 1 height should shift to row 2
      expect(sheet.getRowHeight(2)).toBe(50);
      // Old row 2 height should shift to row 3
      expect(sheet.getRowHeight(3)).toBe(60);
    });

    it('should preserve cell formats when inserting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '1234.56');
      sheet.setCellFormat('A1', CellFormat.Number);
      sheet.setCellContent('A2', '9876.54');
      sheet.setCellFormat('A2', CellFormat.Currency);

      sheet.insertRowAbove(1); // Insert above row 2

      // A1 format should stay the same
      expect(sheet.getCellFormat('A1')).toBe(CellFormat.Number);
      // A2 should have default format (new row)
      expect(sheet.getCellFormat('A2')).toBe(CellFormat.Raw);
      // Old A2 format should move to A3
      expect(sheet.getCellFormat('A3')).toBe(CellFormat.Currency);
    });

    it('should handle inserting at row 0', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');

      sheet.insertRowAbove(0); // Insert above row 1

      // A1 should now be empty
      expect(sheet.getCellContent('A1')).toBe('');
      // Old A1 should move to A2
      expect(sheet.getCellContent('A2')).toBe('10');
      // Old A2 should move to A3
      expect(sheet.getCellContent('A3')).toBe('20');
    });

    it('should return empty array for invalid row index', () => {
      const sheet = new Spreadsheet(5, 5);
      expect(sheet.insertRowAbove(-1)).toEqual([]);
      expect(sheet.insertRowAbove(20)).toEqual([]);
    });
  });

  describe('insertRowBelow', () => {
    it('should insert a new empty row below', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');

      sheet.insertRowBelow(0); // Insert below row 1

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 should now be empty (new row)
      expect(sheet.getCellContent('A2')).toBe('');
      // Old A2 should move to A3
      expect(sheet.getCellContent('A3')).toBe('20');
      // Old A3 should move to A4
      expect(sheet.getCellContent('A4')).toBe('30');
    });

    it('should translate formulas when shifting cells', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '=A1*2');

      sheet.insertRowBelow(0); // Insert below row 1 (at index 1)

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 is now empty (new row)
      expect(sheet.getCellContent('A2')).toBe('');
      // Old A2 moved to A3
      // Reference to A1 stays unchanged (A1 is before insertion point at index 1)
      expect(sheet.getCellContent('A3')).toBe('=A1*2');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple inserts correctly', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');

      // Insert column left of B
      sheet.insertColumnLeft(1);
      expect(sheet.getCellContent('A1')).toBe('10');
      expect(sheet.getCellContent('B1')).toBe('');
      expect(sheet.getCellContent('C1')).toBe('20');

      // Insert another column left of new B
      sheet.insertColumnLeft(1);
      expect(sheet.getCellContent('A1')).toBe('10');
      expect(sheet.getCellContent('B1')).toBe('');
      expect(sheet.getCellContent('C1')).toBe('');
      expect(sheet.getCellContent('D1')).toBe('20');
    });

    it('should handle formulas with ranges when inserting columns', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');
      sheet.setCellContent('D1', '=SUM(A1:C1)');

      sheet.insertColumnLeft(1); // Insert left of B (at index 1)

      // Formula moves from D1 (col 3) to E1 (col 4)
      // Range A1:C1 translates to A1:D1
      // - A1 stays A1 (before insertion point)
      // - C1 becomes D1 (at or after insertion point, shifts by 1)
      expect(sheet.getCellContent('E1')).toBe('=SUM(A1:D1)');
    });

    it('should handle formulas with ranges when inserting rows', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');
      sheet.setCellContent('A4', '=SUM(A1:A3)');

      sheet.insertRowAbove(1); // Insert above row 2 (at index 1)

      // Formula moves from A4 (row 3) to A5 (row 4)
      // Range A1:A3 translates to A1:A4
      // - A1 stays A1 (before insertion point)
      // - A3 becomes A4 (at or after insertion point, shifts by 1)
      expect(sheet.getCellContent('A5')).toBe('=SUM(A1:A4)');
    });
  });

  describe('deleteColumn', () => {
    it('should delete column and shift cells left', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');
      sheet.setCellContent('D1', '40');

      const affectedCells = sheet.deleteColumn(1); // Delete column B

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 should now have old C1 value
      expect(sheet.getCellContent('B1')).toBe('30');
      // C1 should now have old D1 value
      expect(sheet.getCellContent('C1')).toBe('40');
      // D1 should be empty
      expect(sheet.getCellContent('D1')).toBe('');

      // Should return affected cells
      expect(affectedCells.length).toBeGreaterThan(0);
    });

    it('should translate formulas when deleting columns', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '=A1+B1');
      sheet.setCellContent('D1', '=C1*2');

      sheet.deleteColumn(1); // Delete column B

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // B1 should now have old C1 formula
      // Reference to A1 stays (before deleted column)
      // Reference to B1 becomes #REF! (deleted column)
      expect(sheet.getCellContent('B1')).toBe('=A1+#REF!');
      // C1 should now have old D1 formula
      // Reference to C1 becomes B1 (shifted left by 1)
      expect(sheet.getCellContent('C1')).toBe('=B1*2');
    });

    it('should convert references TO deleted column into #REF! errors', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '=B1*2');
      sheet.setCellContent('D1', '=A1+B1');

      sheet.deleteColumn(1); // Delete column B

      // B1 (old C1) should reference #REF! for deleted B
      expect(sheet.getCellContent('B1')).toBe('=#REF!*2');
      // C1 (old D1) should reference #REF! for deleted B
      expect(sheet.getCellContent('C1')).toBe('=A1+#REF!');
    });

    it('should shift column widths when deleting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setColumnWidth(0, 120);
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 180);
      sheet.setColumnWidth(3, 200);

      sheet.deleteColumn(1); // Delete column B

      // Column 0 (A) should keep its width
      expect(sheet.getColumnWidth(0)).toBe(120);
      // Column 1 (old C) should have old column 2 width
      expect(sheet.getColumnWidth(1)).toBe(180);
      // Column 2 (old D) should have old column 3 width
      expect(sheet.getColumnWidth(2)).toBe(200);
      // Column 3 should have default width
      expect(sheet.getColumnWidth(3)).toBe(100);
    });

    it('should shift cell formats when deleting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellFormat('A1', CellFormat.Number);
      sheet.setCellContent('B1', '20');
      sheet.setCellFormat('B1', CellFormat.Currency);
      sheet.setCellContent('C1', '30');
      sheet.setCellFormat('C1', CellFormat.Percentage);

      sheet.deleteColumn(1); // Delete column B

      // A1 format should stay the same
      expect(sheet.getCellFormat('A1')).toBe(CellFormat.Number);
      // B1 should have old C1 format
      expect(sheet.getCellFormat('B1')).toBe(CellFormat.Percentage);
      // C1 should have default format
      expect(sheet.getCellFormat('C1')).toBe(CellFormat.Raw);
    });

    it('should handle deleting first column', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');

      sheet.deleteColumn(0); // Delete column A

      // A1 should now have old B1 value
      expect(sheet.getCellContent('A1')).toBe('20');
      // B1 should now have old C1 value
      expect(sheet.getCellContent('B1')).toBe('30');
      // C1 should be empty
      expect(sheet.getCellContent('C1')).toBe('');
    });

    it('should handle formulas with ranges when deleting columns', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('B1', '20');
      sheet.setCellContent('C1', '30');
      sheet.setCellContent('D1', '40');
      sheet.setCellContent('E1', '=SUM(A1:D1)');

      sheet.deleteColumn(1); // Delete column B

      // Formula moves from E1 (col 4) to D1 (col 3)
      // Range A1:D1 translates to A1:C1
      // - A1 stays A1 (before deleted column)
      // - D1 becomes C1 (after deleted column, shifts left)
      expect(sheet.getCellContent('D1')).toBe('=SUM(A1:C1)');
    });

    it('should return empty array for invalid column index', () => {
      const sheet = new Spreadsheet(5, 5);
      expect(sheet.deleteColumn(-1)).toEqual([]);
      expect(sheet.deleteColumn(10)).toEqual([]);
    });
  });

  describe('deleteRow', () => {
    it('should delete row and shift cells up', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');
      sheet.setCellContent('A4', '40');

      const affectedCells = sheet.deleteRow(1); // Delete row 2

      // A1 should stay the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 should now have old A3 value
      expect(sheet.getCellContent('A2')).toBe('30');
      // A3 should now have old A4 value
      expect(sheet.getCellContent('A3')).toBe('40');
      // A4 should be empty
      expect(sheet.getCellContent('A4')).toBe('');

      // Should return affected cells
      expect(affectedCells.length).toBeGreaterThan(0);
    });

    it('should translate formulas when deleting rows', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '=A1+A2');
      sheet.setCellContent('A4', '=A3*2');

      sheet.deleteRow(1); // Delete row 2

      // A1 stays the same
      expect(sheet.getCellContent('A1')).toBe('10');
      // A2 should now have old A3 formula
      // Reference to A1 stays (before deleted row)
      // Reference to A2 becomes #REF! (deleted row)
      expect(sheet.getCellContent('A2')).toBe('=A1+#REF!');
      // A3 should now have old A4 formula
      // Reference to A3 becomes A2 (shifted up by 1)
      expect(sheet.getCellContent('A3')).toBe('=A2*2');
    });

    it('should convert references TO deleted row into #REF! errors', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '=A2*2');
      sheet.setCellContent('A4', '=A1+A2');

      sheet.deleteRow(1); // Delete row 2

      // A2 (old A3) should reference #REF! for deleted A2
      expect(sheet.getCellContent('A2')).toBe('=#REF!*2');
      // A3 (old A4) should reference #REF! for deleted A2
      expect(sheet.getCellContent('A3')).toBe('=A1+#REF!');
    });

    it('should shift row heights when deleting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setRowHeight(0, 40);
      sheet.setRowHeight(1, 50);
      sheet.setRowHeight(2, 60);
      sheet.setRowHeight(3, 70);

      sheet.deleteRow(1); // Delete row 2

      // Row 0 should keep its height
      expect(sheet.getRowHeight(0)).toBe(40);
      // Row 1 (old row 2) should have old row 2 height
      expect(sheet.getRowHeight(1)).toBe(60);
      // Row 2 (old row 3) should have old row 3 height
      expect(sheet.getRowHeight(2)).toBe(70);
      // Row 3 should have default height
      expect(sheet.getRowHeight(3)).toBe(32);
    });

    it('should shift cell formats when deleting', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellFormat('A1', CellFormat.Number);
      sheet.setCellContent('A2', '20');
      sheet.setCellFormat('A2', CellFormat.Currency);
      sheet.setCellContent('A3', '30');
      sheet.setCellFormat('A3', CellFormat.Percentage);

      sheet.deleteRow(1); // Delete row 2

      // A1 format should stay the same
      expect(sheet.getCellFormat('A1')).toBe(CellFormat.Number);
      // A2 should have old A3 format
      expect(sheet.getCellFormat('A2')).toBe(CellFormat.Percentage);
      // A3 should have default format
      expect(sheet.getCellFormat('A3')).toBe(CellFormat.Raw);
    });

    it('should handle deleting first row', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');

      sheet.deleteRow(0); // Delete row 1

      // A1 should now have old A2 value
      expect(sheet.getCellContent('A1')).toBe('20');
      // A2 should now have old A3 value
      expect(sheet.getCellContent('A2')).toBe('30');
      // A3 should be empty
      expect(sheet.getCellContent('A3')).toBe('');
    });

    it('should handle formulas with ranges when deleting rows', () => {
      const sheet = new Spreadsheet(5, 5);
      sheet.setCellContent('A1', '10');
      sheet.setCellContent('A2', '20');
      sheet.setCellContent('A3', '30');
      sheet.setCellContent('A4', '40');
      sheet.setCellContent('A5', '=SUM(A1:A4)');

      sheet.deleteRow(1); // Delete row 2

      // Formula moves from A5 (row 4) to A4 (row 3)
      // Range A1:A4 translates to A1:A3
      // - A1 stays A1 (before deleted row)
      // - A4 becomes A3 (after deleted row, shifts up)
      expect(sheet.getCellContent('A4')).toBe('=SUM(A1:A3)');
    });

    it('should return empty array for invalid row index', () => {
      const sheet = new Spreadsheet(5, 5);
      expect(sheet.deleteRow(-1)).toEqual([]);
      expect(sheet.deleteRow(20)).toEqual([]);
    });
  });
});
