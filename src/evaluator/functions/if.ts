import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { toBoolean, expandArgs } from './helpers';

/**
 * IF function - Conditional logic
 */
export function ifFunction(args: FunctionArgs): number | string {
  if (args.length !== 3) {
    throw new FunctionArgumentError('IF', 'requires exactly 3 arguments');
  }
  const values = expandArgs(args);
  const condition = toBoolean(values[0]);
  return condition ? values[1] : values[2];
}
