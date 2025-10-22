import { CellFormat, type CellValueNullable } from '../types/core';
import { formatAsBoolean } from './format-boolean';
import { formatAsCurrency } from './format-currency';
import { formatAsDate } from './format-date';
import { formatAsNumber } from './format-number';
import { formatAsPercentage } from './format-percentage';
import { formatAsRaw } from './format-raw';
import { formatAsTime } from './format-time';

/**
 * Apply cell formatting to a value based on the specified format type.
 *
 * @param value - The cell value to format (number, string, or null)
 * @param format - The desired format type (Number, Currency, Percentage, etc.)
 * @returns Formatted string representation of the value
 *
 * @example
 * formatCellValue(1234.5, CellFormat.Number) // "1,234.50"
 * formatCellValue(0.75, CellFormat.Percentage) // "75.00%"
 * formatCellValue(1234.5, CellFormat.Currency) // "$1,234.50"
 */
export function formatCellValue(value: CellValueNullable, format: CellFormat): string {
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
