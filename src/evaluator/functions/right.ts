import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireExactly, toNumber } from './helpers';

/**
 * RIGHT function - Extract from right
 */
export function right(args: FunctionArgs): string {
  requireExactly('RIGHT', args, 2);
  const values = expandArgs(args);
  const text = String(values[0]);
  const numChars = toNumber(values[1]);
  return text.substring(text.length - numChars);
}
