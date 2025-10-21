import { toNumberOrFallback } from './helpers';

/**
 * Format a Unix timestamp (in milliseconds) as a date (uses browser locale)
 */
export function formatAsDate(value: number | string | null): string {
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

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
