import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber, expandArgs } from './helpers';
import { FunctionArgs } from '../../types/core';

/**
 * MAX function - Find maximum value
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function max(args: FunctionArgs): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('MAX', 'requires at least one argument');
  }
  const values = expandArgs(args);
  return Math.max(...values.map(v => toNumber(v)));
}
