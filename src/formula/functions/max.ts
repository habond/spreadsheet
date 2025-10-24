import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne, toNumber } from './helpers';

/**
 * MAX function - Find maximum value
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function max(args: FunctionArgs): number {
  requireAtLeastOne('MAX', args);
  const values = expandArgs(args);
  return Math.max(...values.map(v => toNumber(v)));
}
