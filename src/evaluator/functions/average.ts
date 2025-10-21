import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * AVERAGE/AVG function - Calculate average of arguments
 */
export function average(args: (number | string)[]): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('AVERAGE', 'requires at least one argument');
  }
  const sum = args.reduce((s: number, val) => s + toNumber(val), 0);
  return sum / args.length;
}
