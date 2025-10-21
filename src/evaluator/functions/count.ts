import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * COUNT function - Count numeric values
 */
export function count(args: (number | string)[]): number {
  if (args.length === 0) {
    throw new FunctionArgumentError('COUNT', 'requires at least one argument');
  }
  return args.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
}
