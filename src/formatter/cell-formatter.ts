import { CellFormat, CellValueNullable } from '../types/core';
import { formatAsNumber } from './format-number';
import { formatAsCurrency } from './format-currency';
import { formatAsPercentage } from './format-percentage';
import { formatAsDate } from './format-date';
import { formatAsTime } from './format-time';
import { formatAsBoolean } from './format-boolean';
import { formatAsRaw } from './format-raw';

/**
 * Apply cell formatting to a value
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
