import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireExactly, toBoolean } from './helpers';

/**
 * IF function - Conditional logic
 */
export function ifFunction(args: FunctionArgs): number | string {
  requireExactly('IF', args, 3);
  const values = expandArgs(args);
  const condition = toBoolean(values[0]);
  return condition ? values[1] : values[2];
}
