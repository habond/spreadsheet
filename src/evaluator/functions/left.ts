import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * LEFT function - Extract from left
 */
export function left(args: FunctionArgs): string {
  if (args.length !== 2) {
    throw new FunctionArgumentError('LEFT', 'requires exactly 2 arguments');
  }
  const values = expandArgs(args);
  const text = String(values[0]);
  const numChars = toNumber(values[1]);
  return text.substring(0, numChars);
}
