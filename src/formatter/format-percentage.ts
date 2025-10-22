import { CellValueNullable } from '../types/core';
import { toNumberOrFallback } from './helpers';

/**
 * Format a number as a percentage (multiply by 100 and add %)
 */
export function formatAsPercentage(value: CellValueNullable): string {
  const numValue = toNumberOrFallback(value);
  if (numValue === null) {
    // If not a valid number, fall back to Raw formatting
    return String(value === null ? '' : value);
  }

  return (
    (numValue * 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  );
}
