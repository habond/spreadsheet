import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * AVERAGE/AVG function - Calculate average of arguments
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function average(args: FunctionArgs): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('AVERAGE', 'requires at least one argument');
  }
  const values = expandArgs(args);
  const sum = values.reduce((s: number, val) => s + toNumber(val), 0);
  return sum / values.length;
}
