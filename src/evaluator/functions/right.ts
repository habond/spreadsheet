import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * RIGHT function - Extract from right
 */
export function right(args: FunctionArgs): string {
  if (args.length !== 2) {
    throw new FunctionArgumentError('RIGHT', 'requires exactly 2 arguments');
  }
  const values = expandArgs(args);
  const text = String(values[0]);
  const numChars = toNumber(values[1]);
  return text.substring(text.length - numChars);
}
