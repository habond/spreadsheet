import type { CellValueNullable } from '../types/core';

/**
 * Format a value as raw (no special formatting)
 */
export function formatAsRaw(value: CellValueNullable): string {
  if (value === null) return '';
  return String(value);
}
