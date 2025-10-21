import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * CONCATENATE/CONCAT function - Join text strings
 */
export function concatenate(args: (number | string)[]): string {
  if (args.length === 0) {
    throw new FunctionArgumentError('CONCATENATE', 'requires at least one argument');
  }
  return args.map(String).join('');
}
