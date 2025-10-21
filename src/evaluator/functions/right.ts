import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * RIGHT function - Extract from right
 */
export function right(args: (number | string)[]): string {
  if (args.length !== 2) {
    throw new FunctionArgumentError('RIGHT', 'requires exactly 2 arguments');
  }
  const text = String(args[0]);
  const numChars = toNumber(args[1]);
  return text.substring(text.length - numChars);
}
