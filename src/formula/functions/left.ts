import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireExactly, toNumber } from './helpers';

/**
 * LEFT function - Extract from left
 */
export function left(args: FunctionArgs): string {
  requireExactly('LEFT', args, 2);
  const values = expandArgs(args);
  const text = String(values[0]);
  const numChars = toNumber(values[1]);
  return text.substring(0, numChars);
}
