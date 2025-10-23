import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne, toNumber } from './helpers';

/**
 * SUM function - Add all arguments
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function sum(args: FunctionArgs): number {
  requireAtLeastOne('SUM', args);
  const values = expandArgs(args);
  return values.reduce((sum: number, val) => sum + toNumber(val), 0);
}
