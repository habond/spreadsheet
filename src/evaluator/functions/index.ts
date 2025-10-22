import type { FunctionArgs, CellValueNullable, CellValue } from '../../types/core';
import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../errors/FormulaParseError';
import { toNumber } from './helpers';

/**
 * INDEX - Return a value from a range at a specific position
 *
 * Syntax: INDEX(array, row_num, [column_num])
 *
 * @param array - The range to retrieve from
 * @param row_num - The row position (1-based) to retrieve
 * @param column_num - Optional. The column position (1-based) to retrieve
 *                     If omitted and array is 1D, returns the value at row_num position
 *
 * Returns: The value at the specified position
 *
 * Examples:
 * - INDEX(A1:A10, 3) → returns value from 3rd cell in range
 * - INDEX(A1:C5, 2, 3) → returns value from row 2, column 3 of range
 * - INDEX(A1:A1, 1) → returns value from single cell
 */
export function index(args: FunctionArgs): CellValue {
  // Validate argument count (2 or 3 arguments)
  if (args.length < 2 || args.length > 3) {
    throw new FunctionArgumentError('INDEX', 'INDEX requires 2 or 3 arguments');
  }

  const array = args[0];

  // Extract row number (must be scalar)
  const rowNumArg = args[1];
  if (Array.isArray(rowNumArg)) {
    throw new FunctionArgumentError('INDEX', 'row_num must be a single value, not a range');
  }
  const rowNum = toNumber(rowNumArg as CellValue);

  // Extract column number (optional, must be scalar if provided)
  let colNum: number | null = null;
  if (args.length === 3) {
    const colNumArg = args[2];
    if (Array.isArray(colNumArg)) {
      throw new FunctionArgumentError('INDEX', 'column_num must be a single value, not a range');
    }
    colNum = toNumber(colNumArg as CellValue);
  }

  // Validate row and column numbers are positive integers
  if (rowNum < 1 || !Number.isInteger(rowNum)) {
    throw new FunctionArgumentError('INDEX', 'row_num must be a positive integer');
  }

  if (colNum !== null && (colNum < 1 || !Number.isInteger(colNum))) {
    throw new FunctionArgumentError('INDEX', 'column_num must be a positive integer');
  }

  // Handle 2D array
  if (Array.isArray(array) && array.length > 0 && Array.isArray(array[0])) {
    const grid = array as CellValueNullable[][];

    // Validate row number
    if (rowNum > grid.length) {
      throw new FunctionArgumentError(
        'INDEX',
        `row_num ${rowNum} is out of range (array has ${grid.length} rows)`
      );
    }

    const row = grid[rowNum - 1]; // Convert to 0-based

    // If no column specified, return entire row (or error if not 1D result)
    if (colNum === null) {
      if (row.length === 1) {
        const resultValue = row[0];
        if (resultValue === null) {
          throw new FormulaParseError('INDEX: result cell is empty');
        }
        return resultValue;
      }
      throw new FunctionArgumentError(
        'INDEX',
        'column_num is required when array has multiple columns'
      );
    }

    // Validate column number
    if (colNum > row.length) {
      throw new FunctionArgumentError(
        'INDEX',
        `column_num ${colNum} is out of range (array has ${row.length} columns)`
      );
    }

    const resultValue = row[colNum - 1]; // Convert to 0-based
    if (resultValue === null) {
      throw new FormulaParseError('INDEX: result cell is empty');
    }

    return resultValue;
  }

  // Handle 1D array (single row or column)
  if (Array.isArray(array)) {
    const flatArray = array.flat(Infinity) as CellValueNullable[];

    if (flatArray.length === 0) {
      throw new FunctionArgumentError('INDEX', 'array cannot be empty');
    }

    // If column_num is specified for 1D array, validate it's 1
    if (colNum !== null && colNum !== 1) {
      throw new FunctionArgumentError(
        'INDEX',
        `column_num ${colNum} is out of range (1D array has 1 column)`
      );
    }

    // Validate row number for 1D array
    if (rowNum > flatArray.length) {
      throw new FunctionArgumentError(
        'INDEX',
        `row_num ${rowNum} is out of range (array has ${flatArray.length} elements)`
      );
    }

    const resultValue = flatArray[rowNum - 1]; // Convert to 0-based
    if (resultValue === null) {
      throw new FormulaParseError('INDEX: result cell is empty');
    }

    return resultValue;
  }

  // Handle single value (scalar)
  if (rowNum === 1 && (colNum === null || colNum === 1)) {
    const resultValue = array as CellValueNullable;
    if (resultValue === null) {
      throw new FormulaParseError('INDEX: result cell is empty');
    }
    return resultValue;
  }

  throw new FunctionArgumentError(
    'INDEX',
    `row_num ${rowNum} or column_num ${colNum} is out of range for single value`
  );
}
