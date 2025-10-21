/**
 * Format a value as raw (no special formatting)
 */
export function formatAsRaw(value: number | string | null): string {
  if (value === null) return '';
  return String(value);
}
