import { CellID } from '../types/core';
import { FormulaParseError } from '../errors/FormulaParseError';
import { columnToNumber, numberToColumn } from './column-utils';

/**
 * Pure utility functions for working with cell ranges
 */

/**
 * Expand a range reference (e.g., "A1:B3") into individual cell references.
 * Cells are expanded column-by-column, then row-by-row (matching Excel/Google Sheets).
 *
 * @example
 * expandRange("A1:B2") // Returns: ["A1", "A2", "B1", "B2"]
 * expandRange("A1:C1") // Returns: ["A1", "B1", "C1"]
 */
export function expandRange(range: string): CellID[] {
  const [start, end] = range.split(':');
  if (!start || !end) {
    throw new FormulaParseError(`Invalid range: ${range}`);
  }

  // Parse start cell
  const startMatch = start.match(/^([A-Z]+)([0-9]+)$/);
  if (!startMatch) {
    throw new FormulaParseError(`Invalid range start: ${start}`);
  }
  const [, startCol, startRowStr] = startMatch;
  const startColNum = columnToNumber(startCol);
  const startRow = parseInt(startRowStr, 10);

  // Parse end cell
  const endMatch = end.match(/^([A-Z]+)([0-9]+)$/);
  if (!endMatch) {
    throw new FormulaParseError(`Invalid range end: ${end}`);
  }
  const [, endCol, endRowStr] = endMatch;
  const endColNum = columnToNumber(endCol);
  const endRow = parseInt(endRowStr, 10);

  // Validate range
  if (startColNum > endColNum || startRow > endRow) {
    throw new FormulaParseError(`Invalid range: start must be before end in ${range}`);
  }

  // Expand range into individual cells (column-by-column, then row-by-row)
  const cells: CellID[] = [];
  for (let col = startColNum; col <= endColNum; col++) {
    for (let row = startRow; row <= endRow; row++) {
      const colLetter = numberToColumn(col);
      cells.push(`${colLetter}${row}`);
    }
  }

  return cells;
}
