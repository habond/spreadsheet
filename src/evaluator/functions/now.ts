import type { FunctionArgs } from '../../types/core';
import { requireExactly } from './helpers';

/**
 * NOW function - Current date and time as timestamp
 */
export function now(args: FunctionArgs): number {
  requireExactly('NOW', args, 0);
  return Date.now();
}
