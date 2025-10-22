import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { expandArgs } from './helpers';

/**
 * CONCATENATE/CONCAT function - Join text strings
 */
export function concatenate(args: FunctionArgs): string {
  if (args.length === 0) {
    throw new FunctionArgumentError('CONCATENATE', 'requires at least one argument');
  }
  const values = expandArgs(args);
  return values.map(String).join('');
}
