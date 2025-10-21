/**
 * Global type definitions for the spreadsheet application
 */

export type CellID = string;

export interface EvalResult {
  value: number | string | null;
  error: string | null;
}

export type GetCellValueFn = (cellId: CellID) => string;
export type GetCellResultFn = (cellId: CellID) => EvalResult | undefined;
export type SetCellResultFn = (cellId: CellID, result: EvalResult) => void;

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
