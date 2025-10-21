/**
 * Spreadsheet Class
 * Simple data store for cell content - does NOT handle evaluation
 */

import { CellID, CellFormat } from '../types/core';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  MIN_COLUMN_WIDTH,
  MIN_ROW_HEIGHT,
} from '../constants/app-constants';
import { columnToNumber, numberToColumn } from '../utils/column-utils';

export interface CellData {
  content: string;
}

export interface CellMap {
  [cellId: CellID]: CellData;
}

export class Spreadsheet {
  readonly rows: number;
  readonly cols: number;
  private cells: CellMap;
  private selectedCell: CellID | null;
  private columnWidths: Map<number, number>;
  private rowHeights: Map<number, number>;
  private cellFormats: Map<CellID, CellFormat>;
  private defaultColumnWidth = DEFAULT_COLUMN_WIDTH;
  private defaultRowHeight = DEFAULT_ROW_HEIGHT;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.cells = {}; // Stores cell data: { "A1": { content: "5" }, "A2": { content: "=ADD(A1, B1)" } }
    this.selectedCell = null;
    this.columnWidths = new Map();
    this.rowHeights = new Map();
    this.cellFormats = new Map();
  }

  /**
   * Get all cells (for debugging purposes)
   */
  getAllCells(): CellMap {
    return { ...this.cells };
  }

  /**
   * Convert column index to letter (0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA)
   */
  columnIndexToLetter(index: number): string {
    return numberToColumn(index + 1); // Convert 0-based to 1-based
  }

  /**
   * Get cell ID from row and column indices
   */
  getCellId(row: number, col: number): CellID {
    return this.columnIndexToLetter(col) + (row + 1);
  }

  /**
   * Get the raw content of a cell
   */
  getCellContent(cellId: CellID): string {
    return this.cells[cellId]?.content || '';
  }

  /**
   * Set cell content (just stores the raw value, does NOT evaluate)
   */
  setCellContent(cellId: CellID, content: string): void {
    this.cells[cellId] = { content };
  }

  /**
   * Select a cell
   */
  selectCell(cellId: CellID): void {
    this.selectedCell = cellId;
  }

  /**
   * Get the currently selected cell
   */
  getSelectedCell(): CellID | null {
    return this.selectedCell;
  }

  /**
   * Parse a cell ID into row and column indices
   */
  parseCellId(cellId: CellID): { row: number; col: number } | null {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colLetters = match[1];
    const rowNum = parseInt(match[2], 10);

    return {
      row: rowNum - 1, // Convert to 0-based index
      col: columnToNumber(colLetters) - 1, // Convert to 0-based index
    };
  }

  /**
   * Navigate to the cell above the currently selected cell
   */
  navigateUp(): CellID | null {
    if (!this.selectedCell) return null;
    const pos = this.parseCellId(this.selectedCell);
    if (!pos || pos.row <= 0) return null;
    return this.getCellId(pos.row - 1, pos.col);
  }

  /**
   * Navigate to the cell below the currently selected cell
   */
  navigateDown(): CellID | null {
    if (!this.selectedCell) return null;
    const pos = this.parseCellId(this.selectedCell);
    if (!pos || pos.row >= this.rows - 1) return null;
    return this.getCellId(pos.row + 1, pos.col);
  }

  /**
   * Navigate to the cell to the left of the currently selected cell
   */
  navigateLeft(): CellID | null {
    if (!this.selectedCell) return null;
    const pos = this.parseCellId(this.selectedCell);
    if (!pos || pos.col <= 0) return null;
    return this.getCellId(pos.row, pos.col - 1);
  }

  /**
   * Navigate to the cell to the right of the currently selected cell
   */
  navigateRight(): CellID | null {
    if (!this.selectedCell) return null;
    const pos = this.parseCellId(this.selectedCell);
    if (!pos || pos.col >= this.cols - 1) return null;
    return this.getCellId(pos.row, pos.col + 1);
  }

  /**
   * Get the width of a column (returns default if not set)
   */
  getColumnWidth(colIndex: number): number {
    return this.columnWidths.get(colIndex) ?? this.defaultColumnWidth;
  }

  /**
   * Set the width of a column
   */
  setColumnWidth(colIndex: number, width: number): void {
    this.columnWidths.set(colIndex, Math.max(MIN_COLUMN_WIDTH, width));
  }

  /**
   * Get the height of a row (returns default if not set)
   */
  getRowHeight(rowIndex: number): number {
    return this.rowHeights.get(rowIndex) ?? this.defaultRowHeight;
  }

  /**
   * Set the height of a row
   */
  setRowHeight(rowIndex: number, height: number): void {
    this.rowHeights.set(rowIndex, Math.max(MIN_ROW_HEIGHT, height));
  }

  /**
   * Get the format of a cell (returns Raw if not set)
   */
  getCellFormat(cellId: CellID): CellFormat {
    return this.cellFormats.get(cellId) ?? CellFormat.Raw;
  }

  /**
   * Set the format of a cell
   */
  setCellFormat(cellId: CellID, format: CellFormat): void {
    this.cellFormats.set(cellId, format);
  }

  /**
   * Get all column widths for grid rendering
   */
  getAllColumnWidths(): number[] {
    const widths: number[] = [];
    for (let i = 0; i < this.cols; i++) {
      widths.push(this.getColumnWidth(i));
    }
    return widths;
  }

  /**
   * Get all row heights for grid rendering
   */
  getAllRowHeights(): number[] {
    const heights: number[] = [];
    for (let i = 0; i < this.rows; i++) {
      heights.push(this.getRowHeight(i));
    }
    return heights;
  }

  /**
   * Export spreadsheet state for persistence
   */
  exportState() {
    return {
      cells: { ...this.cells },
      columnWidths: Array.from(this.columnWidths.entries()),
      rowHeights: Array.from(this.rowHeights.entries()),
      cellFormats: Array.from(this.cellFormats.entries()),
      selectedCell: this.selectedCell,
    };
  }

  /**
   * Import spreadsheet state from persistence
   */
  importState(state: {
    cells: CellMap;
    columnWidths: Array<[number, number]>;
    rowHeights: Array<[number, number]>;
    cellFormats?: Array<[CellID, CellFormat]>;
    selectedCell: CellID | null;
  }): void {
    this.cells = { ...state.cells };
    this.columnWidths = new Map(state.columnWidths);
    this.rowHeights = new Map(state.rowHeights);
    this.cellFormats = new Map(state.cellFormats ?? []);
    this.selectedCell = state.selectedCell;
  }

  /**
   * Clear all data from the spreadsheet
   */
  clear(): void {
    this.cells = {};
    this.columnWidths.clear();
    this.rowHeights.clear();
    this.cellFormats.clear();
    this.selectedCell = 'A1';
  }
}
