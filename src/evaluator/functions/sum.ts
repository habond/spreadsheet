import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * SUM function - Add all arguments
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function sum(args: FunctionArgs): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('SUM', 'requires at least one argument');
  }
  const values = expandArgs(args);
  return values.reduce((sum: number, val) => sum + toNumber(val), 0);
}
