import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne, toNumber } from './helpers';

/**
 * MIN function - Find minimum value
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function min(args: FunctionArgs): number {
  requireAtLeastOne('MIN', args);
  const values = expandArgs(args);
  return Math.min(...values.map(v => toNumber(v)));
}
