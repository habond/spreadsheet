import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * TODAY function - Current date as timestamp
 */
export function today(_args: (number | string)[]): number {
  if (_args.length !== 0) {
    throw new FunctionArgumentError('TODAY', 'requires no arguments');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}
