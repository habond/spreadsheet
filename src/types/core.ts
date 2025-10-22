/**
 * Global type definitions for the spreadsheet application
 */

export type CellID = string;

/**
 * Cell position and geometry types
 */
export interface CellPosition {
  row: number; // 0-based row index
  col: number; // 0-based column index
}

/**
 * Cell value types
 */
export type CellValue = number | string; // Non-null cell value
export type CellValueNullable = CellValue | null; // Cell value that may be empty/null

/**
 * Evaluation result from a cell computation
 */
export interface EvalResult {
  value: CellValueNullable;
  error: string | null;
}

/**
 * Callback function types for dependency injection
 */
export type GetCellValueFn = (cellId: CellID) => string;
export type GetCellResultFn = (cellId: CellID) => EvalResult | undefined;
export type SetCellResultFn = (cellId: CellID, result: EvalResult) => void;

/**
 * Range and grid types
 */
export type RangeReference = string; // Range string like "A1:B3"
export type CellGrid = CellID[][]; // 2D array of cell IDs in row-major order
export type CellRangeValues = CellValueNullable[][]; // 2D array from cell ref or range (null = empty cell)

/**
 * Type aliases for function arguments
 * All cell references and ranges are represented as 2D arrays for consistency
 */
export type FunctionArg = CellValue | CellRangeValues; // Function arguments can be scalars or 2D arrays
export type FunctionArgs = FunctionArg[]; // Array of function arguments

/**
 * Internal evaluation types
 */
export type ScalarOrRange = CellValue | CellRangeValues; // Result from evaluating an AST node

/**
 * Operator types for type safety
 */
export type ArithmeticOperator = '+' | '-' | '*' | '/';
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '=' | '<>';
export type BinaryOperator = ArithmeticOperator | ComparisonOperator;
export type UnaryOperator = '-';

/**
 * Function metadata for UI and validation
 */
export interface FunctionInfo {
  name: string;
  description: string;
  aliases?: string[];
}

/**
 * Cell formatting options
 */
export enum CellFormat {
  Raw = 'Raw',
  Number = 'Number',
  Currency = 'Currency',
  Percentage = 'Percentage',
  Date = 'Date',
  Time = 'Time',
  Boolean = 'Boolean',
}

/**
 * Persistence/serialization types
 * Tuple types for serializing Map structures to JSON
 */
export type ColumnWidthEntry = [colIndex: number, width: number];
export type RowHeightEntry = [rowIndex: number, height: number];
export type CellFormatEntry = [cellId: CellID, format: CellFormat];
