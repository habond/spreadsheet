import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * DATEDIF function - Calculate difference between dates
 */
export function datedif(args: (number | string)[]): number {
  if (args.length !== 3) {
    throw new FunctionArgumentError('DATEDIF', 'requires exactly 3 arguments (start, end, unit)');
  }
  const start = toNumber(args[0]);
  const end = toNumber(args[1]);
  const unit = String(args[2]).toUpperCase();

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
