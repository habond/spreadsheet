import { toNumberOrFallback } from './helpers';

/**
 * Format a number with thousands separator and two decimal places
 */
export function formatAsNumber(value: number | string | null): string {
  const numValue = toNumberOrFallback(value);
  if (numValue === null) {
    // If not a valid number, fall back to Raw formatting
    return String(value === null ? '' : value);
  }

  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
