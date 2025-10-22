import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FunctionArgs } from '../../types/core';
import { toNumber, expandArgs } from './helpers';

/**
 * DATEDIF function - Calculate difference between dates
 */
export function datedif(args: FunctionArgs): number {
  if (args.length !== 3) {
    throw new FunctionArgumentError('DATEDIF', 'requires exactly 3 arguments (start, end, unit)');
  }
  const values = expandArgs(args);
  const start = toNumber(values[0]);
  const end = toNumber(values[1]);
  const unit = String(values[2]).toUpperCase();

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  switch (unit) {
    case 'D': // Days
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    case 'M': // Months
      return (
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth())
      );
    case 'Y': // Years
      return endDate.getFullYear() - startDate.getFullYear();
    default:
      throw new FunctionArgumentError('DATEDIF', `Invalid unit: ${unit}. Use D, M, or Y.`);
  }
}
