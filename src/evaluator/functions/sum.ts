import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * SUM function - Add all arguments
 */
export function sum(args: (number | string)[]): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('SUM', 'requires at least one argument');
  }
  return args.reduce((sum: number, val) => sum + toNumber(val), 0);
}
