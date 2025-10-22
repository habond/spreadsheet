import type { CellValueNullable } from '../types/core';

/**
 * Format a value as a boolean: 1 -> True, 0 -> False, else fall back to Raw
 */
export function formatAsBoolean(value: CellValueNullable): string {
  if (value === null) return '';

  // Check for exact numeric match
  if (value === 1 || value === '1') return 'True';
  if (value === 0 || value === '0') return 'False';

  // Fall back to Raw formatting for all other values
  return String(value);
}
