import { FormulaParseError } from '../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * Flatten arguments that may contain arrays (from ranges) into a single array
 */
export function flattenArgs(args: (number | string | (number | string)[])[]): (number | string)[] {
  const flattened: (number | string)[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      flattened.push(...arg);
    } else {
      flattened.push(arg);
    }
  }
  return flattened;
}

/**
 * Convert a value to a number
 */
export function toNumber(value: number | string): number {
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
export function toBoolean(value: number | string): boolean {
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
export function requireRange(functionName: string, args: unknown[], min: number, max: number): void {
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
): (args: (number | string)[]) => number {
  return (args: (number | string)[]): number => {
    requireExactly(name, args, 2);
    const a = toNumber(args[0]);
    const b = toNumber(args[1]);
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
): (args: (number | string)[]) => string {
  return (args: (number | string)[]): string => {
    requireExactly(name, args, 1);
    return operation(String(args[0]));
  };
}
