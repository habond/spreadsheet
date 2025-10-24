import { FormulaParseError } from '../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { CellValue, CellValueNullable, FunctionArgs } from '../../types/core';
import { require2DArray, requireRange, requireScalar, toBoolean, toNumber } from './helpers';

/**
 * HLOOKUP - Horizontal lookup function
 *
 * Searches for a value in the top row of a table and returns a value
 * in the same column from a row you specify.
 *
 * Syntax: HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])
 *
 * @param lookup_value - The value to search for in the first row
 * @param table_array - The table of data (2D range)
 * @param row_index_num - The row number (1-based) to return a value from
 * @param range_lookup - Optional. TRUE (default) = approximate match, FALSE = exact match
 *                       For approximate match, first row must be sorted ascending
 *
 * Returns: The value from the specified row in the matched column
 *
 * Examples:
 * - HLOOKUP("Product A", A1:D3, 2, FALSE) → finds "Product A" in first row, returns value from row 2
 * - HLOOKUP(100, A1:E5, 3, TRUE) → finds largest value <= 100 in first row, returns value from row 3
 */
export function hlookup(args: FunctionArgs): CellValue {
  requireRange('HLOOKUP', args, 3, 4);

  const lookupValue = args[0];
  requireScalar(lookupValue, 'HLOOKUP', 'lookup_value');

  const tableArray = args[1];

  const rowIndexNumArg = args[2];
  requireScalar(rowIndexNumArg, 'HLOOKUP', 'row_index_num');
  const rowIndexNum = toNumber(rowIndexNumArg);

  let rangeLookup = true;
  if (args.length === 4) {
    const rangeLookupArg = args[3];
    requireScalar(rangeLookupArg, 'HLOOKUP', 'range_lookup');
    rangeLookup = toBoolean(rangeLookupArg);
  }

  // Validate table_array is a 2D array
  require2DArray(tableArray, 'HLOOKUP', 'table_array');

  const table = tableArray as CellValueNullable[][];

  // Validate row_index_num
  if (rowIndexNum < 1 || !Number.isInteger(rowIndexNum)) {
    throw new FunctionArgumentError('HLOOKUP', 'row_index_num must be a positive integer');
  }

  if (rowIndexNum > table.length) {
    throw new FunctionArgumentError(
      'HLOOKUP',
      `row_index_num ${rowIndexNum} is out of range (table has ${table.length} rows)`
    );
  }

  const firstRow = table[0];

  // Exact match (range_lookup = FALSE)
  if (!rangeLookup) {
    let matchIndex = -1;

    for (let col = 0; col < firstRow.length; col++) {
      const cellValue = firstRow[col];

      // Handle numeric comparison
      if (typeof lookupValue === 'number' && typeof cellValue === 'number') {
        if (cellValue === lookupValue) {
          matchIndex = col;
          break;
        }
      }
      // Handle string comparison (case-insensitive)
      else if (typeof lookupValue === 'string' && typeof cellValue === 'string') {
        if (cellValue.toLowerCase() === lookupValue.toLowerCase()) {
          matchIndex = col;
          break;
        }
      }
    }

    if (matchIndex === -1) {
      throw new FunctionArgumentError('HLOOKUP', `Value "${lookupValue}" not found in first row`);
    }

    // Return value from specified row in matched column
    const resultValue = table[rowIndexNum - 1][matchIndex];

    if (resultValue === null) {
      throw new FormulaParseError('HLOOKUP: result cell is empty');
    }

    return resultValue;
  }

  // Approximate match (range_lookup = TRUE)
  // Find largest value <= lookup_value (assumes first row sorted ascending)
  const numLookup = toNumber(lookupValue);
  let bestIndex = -1;

  for (let col = 0; col < firstRow.length; col++) {
    const cellValue = firstRow[col];
    if (cellValue === null) continue; // Skip empty cells

    const numValue = toNumber(cellValue);

    if (numValue <= numLookup) {
      bestIndex = col;
    } else {
      // Since sorted ascending, we can stop
      break;
    }
  }

  if (bestIndex === -1) {
    throw new FunctionArgumentError('HLOOKUP', `No value <= "${lookupValue}" found in first row`);
  }

  // Return value from specified row in matched column
  const resultValue = table[rowIndexNum - 1][bestIndex];

  if (resultValue === null) {
    throw new FormulaParseError('HLOOKUP: result cell is empty');
  }

  return resultValue;
}
