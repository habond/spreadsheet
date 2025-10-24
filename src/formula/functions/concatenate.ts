import type { FunctionArgs } from '../../types/core';
import { expandArgs, requireAtLeastOne } from './helpers';

/**
 * CONCATENATE/CONCAT function - Join text strings
 */
export function concatenate(args: FunctionArgs): string {
  requireAtLeastOne('CONCATENATE', args);
  const values = expandArgs(args);
  return values.map(String).join('');
}
