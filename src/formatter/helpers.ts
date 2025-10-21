/**
 * Helper to convert value to number with fallback
 * Returns null if value cannot be converted to a valid number
 */
export function toNumberOrFallback(value: number | string | null): number | null {
  if (value === null) return null;
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(numValue) ? null : numValue;
}
