/**
 * LocalStorage utility for persisting spreadsheet state
 */

import type { ColumnWidthEntry, RowHeightEntry, CellFormatEntry } from '../types/core';
import type { CellMap } from './spreadsheet';

const STORAGE_KEY = 'spreadsheet-state';

export interface SpreadsheetState {
  cells: CellMap;
  columnWidths: ColumnWidthEntry[];
  rowHeights: RowHeightEntry[];
  cellFormats: CellFormatEntry[];
  selectedCell: string | null;
}

/**
 * Save spreadsheet state to localStorage
 * Silently fails if localStorage is unavailable or quota is exceeded
 */
export function saveSpreadsheetState(state: SpreadsheetState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Silently fail for localStorage quota/access issues
    // Could add telemetry/monitoring here in production
  }
}

/**
 * Load spreadsheet state from localStorage
 * Returns null if unavailable or corrupted
 */
export function loadSpreadsheetState(): SpreadsheetState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch {
    // Silently fail for localStorage access/parse errors
    return null;
  }
}

/**
 * Clear spreadsheet state from localStorage
 * Silently fails if localStorage is unavailable
 */
export function clearSpreadsheetState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail for localStorage access issues
  }
}
