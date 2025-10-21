/**
 * LocalStorage utility for persisting spreadsheet state
 */

import { CellMap } from './spreadsheet';

const STORAGE_KEY = 'spreadsheet-state';

export interface SpreadsheetState {
  cells: CellMap;
  columnWidths: Array<[number, number]>; // Array of [colIndex, width] tuples
  rowHeights: Array<[number, number]>; // Array of [rowIndex, height] tuples
  selectedCell: string | null;
}

/**
 * Save spreadsheet state to localStorage
 */
export function saveSpreadsheetState(state: SpreadsheetState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save spreadsheet state:', error);
  }
}

/**
 * Load spreadsheet state from localStorage
 */
export function loadSpreadsheetState(): SpreadsheetState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load spreadsheet state:', error);
    return null;
  }
}

/**
 * Clear spreadsheet state from localStorage
 */
export function clearSpreadsheetState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear spreadsheet state:', error);
  }
}
