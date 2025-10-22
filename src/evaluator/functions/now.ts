import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FunctionArgs } from '../../types/core';

/**
 * NOW function - Current date and time as timestamp
 */
export function now(_args: FunctionArgs): number {
  if (_args.length !== 0) {
    throw new FunctionArgumentError('NOW', 'requires no arguments');
  }
  return Date.now();
}
