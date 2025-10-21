import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * MIN function - Find minimum value
 */
export function min(args: (number | string)[]): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('MIN', 'requires at least one argument');
  }
  return Math.min(...args.map(v => toNumber(v)));
}
