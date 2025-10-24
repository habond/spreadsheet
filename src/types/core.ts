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

export type Axis = 'column' | 'row';

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
 * Cell styling options
 */
export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export enum FontFamily {
  Arial = 'Arial, sans-serif',
  TimesNewRoman = 'Times New Roman, serif',
  Courier = 'Courier New, monospace',
  Verdana = 'Verdana, sans-serif',
  Georgia = 'Georgia, serif',
  ComicSans = 'Comic Sans MS, cursive',
}

/**
 * Cell style properties
 * All properties are optional - undefined means inherit/default
 */
export interface CellStyle {
  // Text alignment
  textAlign?: TextAlign;

  // Typeface modifiers
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;

  // Font
  fontFamily?: FontFamily;
  fontSize?: number; // In pixels

  // Colors
  textColor?: string; // CSS color string (e.g., "#000000", "rgb(0,0,0)")
  backgroundColor?: string; // CSS color string
}

/**
 * Persistence/serialization types
 * Tuple types for serializing Map structures to JSON
 */
export type ColumnWidthEntry = [colIndex: number, width: number];
export type RowHeightEntry = [rowIndex: number, height: number];
export type CellFormatEntry = [cellId: CellID, format: CellFormat];
export type CellStyleEntry = [cellId: CellID, style: CellStyle];
