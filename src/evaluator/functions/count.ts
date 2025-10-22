import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { expandArgs } from './helpers';

/**
 * COUNT function - Count numeric values
 * Accepts scalars and 2D arrays (from cell refs/ranges)
 */
export function count(args: FunctionArgs): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('COUNT', 'requires at least one argument');
  }
  const values = expandArgs(args);
  return values.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
}
