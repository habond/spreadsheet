import { FormulaParseError } from '../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs, CellValue } from '../../types/core';
import { toNumber } from './helpers';

/**
 * VLOOKUP function - Vertical lookup
 * Searches for a value in the first column of a range and returns a value from a specified column
 *
 * Syntax: VLOOKUP(lookup_value, table_range, col_index_num, [range_lookup])
 *
 * @param lookup_value - The value to search for in the first column
 * @param table_range - The 2D range to search (must be a 2D array)
 * @param col_index_num - The column number (1-based) to return the value from
 * @param range_lookup - Optional. TRUE (1) for approximate match, FALSE (0) for exact match. Default is FALSE.
 *
 * Example: =VLOOKUP("Product A", A1:C10, 2, 0)
 * Searches for "Product A" in column A, returns the value from column B (column 2)
 */
export function vlookup(args: FunctionArgs): CellValue {
  // Validate argument count (3 or 4 arguments)
  if (args.length < 3 || args.length > 4) {
    throw new FunctionArgumentError('VLOOKUP', 'requires 3 or 4 arguments');
  }

  // Validate and extract lookup_value (must be scalar)
  if (Array.isArray(args[0])) {
    throw new FunctionArgumentError('VLOOKUP', 'lookup_value must be a single value, not a range');
  }
  const lookupValue = args[0];

  const tableRange = args[1];
  const colIndexNum = args[2];
  const rangeLookup = args.length === 4 ? args[3] : 0; // Default to exact match (FALSE)

  // Validate table_range is a 2D array
  if (!Array.isArray(tableRange) || !Array.isArray(tableRange[0])) {
    throw new FunctionArgumentError('VLOOKUP', 'table_range must be a 2D range');
  }

  // Validate col_index_num is a positive integer
  // colIndexNum could be a number, string, or 2D array - we only accept scalars
  if (Array.isArray(colIndexNum)) {
    throw new FunctionArgumentError('VLOOKUP', 'col_index_num must be a number, not a range');
  }
  const colIndex = toNumber(colIndexNum);
  if (!Number.isInteger(colIndex) || colIndex < 1) {
    throw new FunctionArgumentError('VLOOKUP', 'col_index_num must be a positive integer');
  }

  // Check if col_index_num exceeds the number of columns in the range
  const numCols = tableRange[0].length;
  if (colIndex > numCols) {
    throw new FunctionArgumentError(
      'VLOOKUP',
      `col_index_num (${colIndex}) exceeds number of columns in range (${numCols})`
    );
  }

  // Determine if we're doing approximate match (range_lookup = TRUE/1) or exact match (FALSE/0)
  const isApproximateMatch =
    typeof rangeLookup === 'number' ? rangeLookup !== 0 : Boolean(rangeLookup);

  // Convert lookup value for comparison (used in approximate match)
  const lookupNum = typeof lookupValue === 'number' ? lookupValue : parseFloat(String(lookupValue));
  const isLookupNumeric = !isNaN(lookupNum);

  if (isApproximateMatch) {
    // Approximate match: find the largest value <= lookup_value
    // Assumes first column is sorted in ascending order
    let bestMatchRow = -1;
    let bestMatchValue: number | null = null;

    for (let row = 0; row < tableRange.length; row++) {
      const firstColValue = tableRange[row][0];

      // Skip null/empty cells
      if (firstColValue === null) {
        continue;
      }

      // For approximate match, we compare numerically
      const cellNum =
        typeof firstColValue === 'number' ? firstColValue : parseFloat(String(firstColValue));

      if (isNaN(cellNum)) {
        continue; // Skip non-numeric values in approximate match mode
      }

      if (!isLookupNumeric) {
        continue; // Can't do approximate match with non-numeric lookup value
      }

      // Check if this value is <= lookup value
      if (cellNum <= lookupNum) {
        // Update best match if this is better (larger)
        if (bestMatchValue === null || cellNum > bestMatchValue) {
          bestMatchValue = cellNum;
          bestMatchRow = row;
        }
      }
    }

    if (bestMatchRow === -1) {
      throw new FormulaParseError(`VLOOKUP: no match found for '${lookupValue}'`);
    }

    // Return the value from the specified column (col_index_num is 1-based)
    const resultValue = tableRange[bestMatchRow][colIndex - 1];

    if (resultValue === null) {
      throw new FormulaParseError(`VLOOKUP: result cell is empty`);
    }

    return resultValue;
  } else {
    // Exact match: find the first exact match
    // First pass: Try to find a type-exact match (same type as lookup value)
    for (let row = 0; row < tableRange.length; row++) {
      const firstColValue = tableRange[row][0];

      // Skip null/empty cells
      if (firstColValue === null) {
        continue;
      }

      let matches = false;

      // Type-exact matching only in first pass
      if (typeof lookupValue === 'number' && typeof firstColValue === 'number') {
        // Both are numbers - direct comparison
        matches = firstColValue === lookupValue;
      } else if (typeof lookupValue === 'string' && typeof firstColValue === 'string') {
        // Both are strings - case-insensitive comparison
        matches = firstColValue.toLowerCase() === lookupValue.toLowerCase();
      }

      if (matches) {
        // Return the value from the specified column (col_index_num is 1-based)
        const resultValue = tableRange[row][colIndex - 1];

        if (resultValue === null) {
          throw new FormulaParseError(`VLOOKUP: result cell is empty`);
        }

        return resultValue;
      }
    }

    // Second pass: Try cross-type matching if no type-exact match was found
    for (let row = 0; row < tableRange.length; row++) {
      const firstColValue = tableRange[row][0];

      // Skip null/empty cells
      if (firstColValue === null) {
        continue;
      }

      let matches = false;

      // Cross-type matching
      if (typeof lookupValue === 'number' && typeof firstColValue === 'string') {
        // Numeric lookup, string cell - try parsing the string
        const cellNum = parseFloat(firstColValue);
        matches = !isNaN(cellNum) && cellNum === lookupValue;
      } else if (typeof lookupValue === 'string' && typeof firstColValue === 'number') {
        // String lookup, numeric cell - try parsing the lookup string
        const lookupNumParsed = parseFloat(lookupValue);
        matches = !isNaN(lookupNumParsed) && firstColValue === lookupNumParsed;
      }

      if (matches) {
        // Return the value from the specified column (col_index_num is 1-based)
        const resultValue = tableRange[row][colIndex - 1];

        if (resultValue === null) {
          throw new FormulaParseError(`VLOOKUP: result cell is empty`);
        }

        return resultValue;
      }
    }

    // No match found
    throw new FormulaParseError(`VLOOKUP: no match found for '${lookupValue}'`);
  }
}
