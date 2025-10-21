import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * NOW function - Current date and time as timestamp
 */
export function now(_args: (number | string)[]): number {
  if (_args.length !== 0) {
    throw new FunctionArgumentError('NOW', 'requires no arguments');
  }
  return Date.now();
}
