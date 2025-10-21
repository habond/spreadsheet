import { CellID, EvalResult, CellFormat } from '../types/core';
import { formatCellValue } from '../formatter/cell-formatter';

/**
 * Manages evaluation results for all cells in the spreadsheet.
 * Handles storage, retrieval, and formatting of cell evaluation results.
 */
export class CellResultStore {
  private results = new Map<CellID, EvalResult>();
  private getCellFormat: (cellId: CellID) => CellFormat;

  /**
   * Creates a new CellResultStore
   * @param getCellFormat - Function to retrieve the format for a given cell
   */
  constructor(getCellFormat: (cellId: CellID) => CellFormat) {
    this.getCellFormat = getCellFormat;
  }

  /**
   * Get the evaluation result for a cell
   * @param cellId - The cell identifier (e.g., "A1", "B2")
   * @returns The evaluation result or undefined if not yet evaluated
   */
  get(cellId: CellID): EvalResult | undefined {
    return this.results.get(cellId);
  }

  /**
   * Set the evaluation result for a cell
   * @param cellId - The cell identifier (e.g., "A1", "B2")
   * @param result - The evaluation result to store
   */
  set(cellId: CellID, result: EvalResult): void {
    this.results.set(cellId, result);
  }

  /**
   * Get the display value for a cell (applies formatting)
   * @param cellId - The cell identifier (e.g., "A1", "B2")
   * @returns The formatted display value or '#ERROR' if there's an error
   */
  getDisplayValue(cellId: CellID): string {
    const result = this.results.get(cellId);
    if (!result) {
      return '';
    }
    if (result.error) {
      return '#ERROR';
    }

    const format = this.getCellFormat(cellId);
    return formatCellValue(result.value, format);
  }

  /**
   * Get all cell IDs that have results
   * @returns Array of all cell identifiers with stored results
   */
  getAllCellIds(): CellID[] {
    return Array.from(this.results.keys());
  }

  /**
   * Clear all results from the store
   */
  clear(): void {
    this.results.clear();
  }
}
