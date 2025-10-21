import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * LEFT function - Extract from left
 */
export function left(args: (number | string)[]): string {
  if (args.length !== 2) {
    throw new FunctionArgumentError('LEFT', 'requires exactly 2 arguments');
  }
  const text = String(args[0]);
  const numChars = toNumber(args[1]);
  return text.substring(0, numChars);
}
