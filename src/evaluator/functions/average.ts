import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne, toNumber } from './helpers';

/**
 * AVERAGE/AVG function - Calculate average of arguments
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function average(args: FunctionArgs): number {
  requireAtLeastOne('AVERAGE', args);
  const values = expandArgs(args);
  const sum = values.reduce((s: number, val) => s + toNumber(val), 0);
  return sum / values.length;
}
