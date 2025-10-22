import { CellID, EvalResult, CellFormat } from '../types/core';
import { formatCellValue } from '../formatter/cell-formatter';

type Listener = () => void;

/**
 * Manages evaluation results for all cells in the spreadsheet.
 * Handles storage, retrieval, and formatting of cell evaluation results.
 * Implements a pub-sub model for efficient React rendering.
 */
export class CellResultStore {
  private results = new Map<CellID, EvalResult>();
  private getCellFormat: (cellId: CellID) => CellFormat;
  private listeners = new Map<CellID, Set<Listener>>();

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
    this.notifyListeners(cellId);
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

  /**
   * Subscribe to changes for a specific cell
   * @param cellId - The cell identifier to subscribe to
   * @param listener - Callback function to invoke when the cell changes
   * @returns Unsubscribe function
   */
  subscribe(cellId: CellID, listener: Listener): () => void {
    if (!this.listeners.has(cellId)) {
      this.listeners.set(cellId, new Set());
    }
    this.listeners.get(cellId)!.add(listener);

    // Return unsubscribe function
    return () => {
      const cellListeners = this.listeners.get(cellId);
      if (cellListeners) {
        cellListeners.delete(listener);
        if (cellListeners.size === 0) {
          this.listeners.delete(cellId);
        }
      }
    };
  }

  /**
   * Notify all listeners for a specific cell
   * @param cellId - The cell identifier that changed
   */
  private notifyListeners(cellId: CellID): void {
    const cellListeners = this.listeners.get(cellId);
    if (cellListeners) {
      cellListeners.forEach(listener => listener());
    }
  }
}
