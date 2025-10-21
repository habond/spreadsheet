/**
 * Global type definitions for the spreadsheet application
 */

export type CellID = string;

export interface EvalResult {
  value: any;
  error: string | null;
}

export type GetCellValueFn = (cellId: CellID) => string;
export type GetCellResultFn = (cellId: CellID) => EvalResult | undefined;
export type SetCellResultFn = (cellId: CellID, result: EvalResult) => void;
