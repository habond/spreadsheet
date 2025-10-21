import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * MAX function - Find maximum value
 */
export function max(args: (number | string)[]): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('MAX', 'requires at least one argument');
  }
  return Math.max(...args.map(v => toNumber(v)));
}
