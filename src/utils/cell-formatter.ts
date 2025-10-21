import { CellFormat } from '../core/types';

/**
 * Format a number with thousands separator and two decimal places
 */
function formatAsNumber(value: number | string | null): string {
  if (value === null) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) {
    // If not a valid number, fall back to Raw formatting
    return String(value);
  }

  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a number as currency (uses browser locale)
 */
function formatAsCurrency(value: number | string | null): string {
  if (value === null) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) {
    // If not a valid number, fall back to Raw formatting
    return String(value);
  }

  // Use USD as default currency (can be made configurable in the future)
  return numValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

/**
 * Format a number as a percentage (multiply by 100 and add %)
 */
function formatAsPercentage(value: number | string | null): string {
  if (value === null) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) {
    // If not a valid number, fall back to Raw formatting
    return String(value);
  }

  return (
    (numValue * 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  );
}

/**
 * Format a Unix timestamp (in milliseconds) as a date (uses browser locale)
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

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a Unix timestamp (in milliseconds) as time (uses browser locale)
 */
function formatAsTime(value: number | string | null): string {
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

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
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
    case CellFormat.Number:
      return formatAsNumber(value);
    case CellFormat.Currency:
      return formatAsCurrency(value);
    case CellFormat.Percentage:
      return formatAsPercentage(value);
    case CellFormat.Date:
      return formatAsDate(value);
    case CellFormat.Time:
      return formatAsTime(value);
    case CellFormat.Boolean:
      return formatAsBoolean(value);
    case CellFormat.Raw:
    default:
      return formatAsRaw(value);
  }
}
