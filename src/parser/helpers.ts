import { CellID, RangeReference, CellGrid } from '../types/core';
import { FormulaParseError } from '../errors/FormulaParseError';
import { columnToNumber, numberToColumn } from '../utils/column-utils';

/**
 * Pure utility functions for working with cell ranges
 */

/**
 * Expand a range reference (e.g., "A1:B3") into a 2D array of cell references.
 * Returns cells in row-major order: array of rows, where each row is an array of cell IDs.
 *
 * @example
 * expandRange("A1:C2") // Returns: [["A1", "B1", "C1"], ["A2", "B2", "C2"]]
 * expandRange("A1:A3") // Returns: [["A1"], ["A2"], ["A3"]]
 * expandRange("A1:C1") // Returns: [["A1", "B1", "C1"]]
 * expandRange("A1")    // Returns: [["A1"]] (single cell as 1x1 2D array)
 */
export function expandRange(range: RangeReference): CellGrid {
  const [start, end] = range.split(':');

  // Single cell reference (no colon)
  if (!end) {
    return [[start]];
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

  // Expand range into 2D array (row-major order)
  const cells: CellGrid = [];
  for (let row = startRow; row <= endRow; row++) {
    const rowCells: CellID[] = [];
    for (let col = startColNum; col <= endColNum; col++) {
      const colLetter = numberToColumn(col);
      rowCells.push(`${colLetter}${row}`);
    }
    cells.push(rowCells);
  }

  return cells;
}
