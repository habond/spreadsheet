import { CellFormat } from '../core/types';

/**
 * Format a Unix timestamp (in milliseconds) as mm/dd/yyyy
 */
function formatAsDate(value: number | string | null): string {
  if (value === null) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) {
    // If not a valid number, fall back to Raw formatting
    return String(value);
  }

  const date = new Date(numValue);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return String(value);
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Format a value as a boolean: 1 -> True, 0 -> False, else fall back to Raw
 */
function formatAsBoolean(value: number | string | null): string {
  if (value === null) return '';

  // Check for exact numeric match
  if (value === 1 || value === '1') return 'True';
  if (value === 0 || value === '0') return 'False';

  // Fall back to Raw formatting for all other values
  return String(value);
}

/**
 * Format a value as raw (no special formatting)
 */
function formatAsRaw(value: number | string | null): string {
  if (value === null) return '';
  return String(value);
}

/**
 * Apply cell formatting to a value
 */
export function formatCellValue(value: number | string | null, format: CellFormat): string {
  switch (format) {
    case CellFormat.Date:
      return formatAsDate(value);
    case CellFormat.Boolean:
      return formatAsBoolean(value);
    case CellFormat.Raw:
    default:
      return formatAsRaw(value);
  }
}
