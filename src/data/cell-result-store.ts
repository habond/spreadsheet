import { CellID, EvalResult, CellFormat } from '../core/types';
import { formatCellValue } from './cell-formatter';

/**
 * Manages evaluation results for all cells in the spreadsheet
 */
export class CellResultStore {
  private results = new Map<CellID, EvalResult>();
  private getCellFormat: (cellId: CellID) => CellFormat;

  constructor(getCellFormat: (cellId: CellID) => CellFormat) {
    this.getCellFormat = getCellFormat;
  }

  /**
   * Get the evaluation result for a cell
   */
  get(cellId: CellID): EvalResult | undefined {
    return this.results.get(cellId);
  }

  /**
   * Set the evaluation result for a cell
   */
  set(cellId: CellID, result: EvalResult): void {
    this.results.set(cellId, result);
  }

  /**
   * Get the display value for a cell (applies formatting)
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
   */
  getAllCellIds(): CellID[] {
    return Array.from(this.results.keys());
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results.clear();
  }
}
