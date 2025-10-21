import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toBoolean } from './helpers';

/**
 * IF function - Conditional logic
 */
export function ifFunction(args: (number | string)[]): number | string {
  if (args.length !== 3) {
    throw new FunctionArgumentError('IF', 'requires exactly 3 arguments');
  }
  const condition = toBoolean(args[0]);
  return condition ? args[1] : args[2];
}
