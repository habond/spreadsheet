import { FormulaParseError } from '../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { CellValue, CellRangeValues, FunctionArgs } from '../../types/core';

/**
 * Expand a 2D array (from cell ref or range) into a flat 1D array, skipping null values
 * @param arr - 2D array where null represents empty/error cells
 * @returns Flat array with only non-null values
 */
export function expand2DArray(arr: CellRangeValues): CellValue[] {
  const result: CellValue[] = [];
  for (const row of arr) {
    for (const value of row) {
      if (value !== null) {
        result.push(value);
      }
    }
  }
  return result;
}

/**
 * Expand all function arguments (scalars and 2D arrays) into a flat 1D array
 * Scalars are included as-is, 2D arrays are expanded and nulls are skipped
 */
export function expandArgs(args: FunctionArgs): CellValue[] {
  const result: CellValue[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      // 2D array - expand it
      result.push(...expand2DArray(arg));
    } else {
      // Scalar value
      result.push(arg);
    }
  }
  return result;
}

/**
 * Convert a value to a number
 */
export function toNumber(value: CellValue): number {
  if (typeof value === 'number') {
    return value;
  }
  const num = parseFloat(String(value));
  if (isNaN(num)) {
    throw new FormulaParseError(`Cannot convert '${value}' to number`);
  }
  return num;
}

/**
 * Convert a value to a boolean
 */
export function toBoolean(value: CellValue): boolean {
  if (typeof value === 'number') {
    return value !== 0;
  }
  const str = String(value).trim().toLowerCase();

  // Explicit true values
  if (str === 'true' || str === '1') {
    return true;
  }

  // Explicit false values
  if (str === 'false' || str === '0' || str === '') {
    return false;
  }

  // Non-empty strings are truthy (Excel convention)
  return str.length > 0;
}

/**
 * Validate that a function has at least one argument
 */
export function requireAtLeastOne(functionName: string, args: unknown[]): void {
  if (args.length === 0) {
    throw new FunctionArgumentError(functionName, 'requires at least one argument');
  }
}

/**
 * Validate that a function has exactly N arguments
 */
export function requireExactly(functionName: string, args: unknown[], count: number): void {
  if (args.length !== count) {
    const plural = count === 1 ? '' : 's';
    throw new FunctionArgumentError(functionName, `requires exactly ${count} argument${plural}`);
  }
}

/**
 * Validate that a function has between min and max arguments (inclusive)
 */
export function requireRange(
  functionName: string,
  args: unknown[],
  min: number,
  max: number
): void {
  if (args.length < min || args.length > max) {
    throw new FunctionArgumentError(
      functionName,
      `requires between ${min} and ${max} arguments, got ${args.length}`
    );
  }
}

/**
 * Create a binary operation function (takes exactly 2 arguments)
 */
export function createBinaryOperation(
  name: string,
  operation: (a: number, b: number) => number,
  validate?: (a: number, b: number) => void
): (args: FunctionArgs) => number {
  return (args: FunctionArgs): number => {
    requireExactly(name, args, 2);
    const values = expandArgs(args);
    const a = toNumber(values[0]);
    const b = toNumber(values[1]);
    validate?.(a, b);
    return operation(a, b);
  };
}

/**
 * Create a unary string operation function (takes exactly 1 argument)
 */
export function createUnaryStringOperation(
  name: string,
  operation: (str: string) => string
): (args: FunctionArgs) => string {
  return (args: FunctionArgs): string => {
    requireExactly(name, args, 1);
    const values = expandArgs(args);
    return operation(String(values[0]));
  };
}
