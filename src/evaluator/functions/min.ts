import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber, expandArgs } from './helpers';
import { FunctionArgs } from '../../types/core';

/**
 * MIN function - Find minimum value
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function min(args: FunctionArgs): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('MIN', 'requires at least one argument');
  }
  const values = expandArgs(args);
  return Math.min(...values.map(v => toNumber(v)));
}
