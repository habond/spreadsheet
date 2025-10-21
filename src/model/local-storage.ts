/**
 * LocalStorage utility for persisting spreadsheet state
 */

import { CellMap } from './spreadsheet';
import { CellID, CellFormat } from '../types/core';

const STORAGE_KEY = 'spreadsheet-state';

export interface SpreadsheetState {
  cells: CellMap;
  columnWidths: Array<[number, number]>; // Array of [colIndex, width] tuples
  rowHeights: Array<[number, number]>; // Array of [rowIndex, height] tuples
  cellFormats?: Array<[CellID, CellFormat]>; // Array of [cellId, format] tuples
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    // Silently fail for localStorage access issues
  }
}
