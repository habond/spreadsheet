import type { CellValueNullable } from '../types/core';
import { toNumberOrFallback } from './helpers';

/**
 * Format a Unix timestamp (in milliseconds) as time (uses browser locale)
 */
export function formatAsTime(value: CellValueNullable): string {
  const numValue = toNumberOrFallback(value);
  if (numValue === null) {
    // If not a valid number, fall back to Raw formatting
    return String(value === null ? '' : value);
  }

  const date = new Date(numValue);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}
