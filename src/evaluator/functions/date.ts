import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * DATE function - Create date from year, month, day
 */
export function date(args: (number | string)[]): number {
  if (args.length !== 3) {
    throw new FunctionArgumentError('DATE', 'requires exactly 3 arguments (year, month, day)');
  }
  const year = toNumber(args[0]);
  const month = toNumber(args[1]);
  const day = toNumber(args[2]);
  return new Date(year, month - 1, day).getTime();
}
