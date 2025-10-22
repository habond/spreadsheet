import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * DATE function - Create date from year, month, day
 */
export function date(args: FunctionArgs): number {
  if (args.length !== 3) {
    throw new FunctionArgumentError('DATE', 'requires exactly 3 arguments (year, month, day)');
  }
  const values = expandArgs(args);
  const year = toNumber(values[0]);
  const month = toNumber(values[1]);
  const day = toNumber(values[2]);
  return new Date(year, month - 1, day).getTime();
}
