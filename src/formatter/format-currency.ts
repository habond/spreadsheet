import type { CellValueNullable } from '../types/core';
import { toNumberOrFallback } from './helpers';

/**
 * Format a number as currency (uses browser locale)
 */
export function formatAsCurrency(value: CellValueNullable): string {
  const numValue = toNumberOrFallback(value);
  if (numValue === null) {
    // If not a valid number, fall back to Raw formatting
    return String(value === null ? '' : value);
  }

  // Use USD as default currency (can be made configurable in the future)
  return numValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}
