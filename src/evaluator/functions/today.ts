import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';

/**
 * TODAY function - Current date as timestamp
 */
export function today(_args: FunctionArgs): number {
  if (_args.length !== 0) {
    throw new FunctionArgumentError('TODAY', 'requires no arguments');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}
