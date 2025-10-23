import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireExactly, toNumber } from './helpers';

/**
 * DATE function - Create date from year, month, day
 */
export function date(args: FunctionArgs): number {
  requireExactly('DATE', args, 3);
  const values = expandArgs(args);
  const year = toNumber(values[0]);
  const month = toNumber(values[1]);
  const day = toNumber(values[2]);
  return new Date(year, month - 1, day).getTime();
}
