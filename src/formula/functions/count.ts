import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne } from './helpers';

/**
 * COUNT function - Count numeric values
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function count(args: FunctionArgs): number {
  requireAtLeastOne('COUNT', args);
  const values = expandArgs(args);
  return values.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
}
