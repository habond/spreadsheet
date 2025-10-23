import type { FunctionArgs } from '../../types/core';
import { requireExactly } from './helpers';

/**
 * TODAY function - Current date as timestamp
 */
export function today(args: FunctionArgs): number {
  requireExactly('TODAY', args, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}
