import { DivisionByZeroError } from '../../errors/DivisionByZeroError';
import { createBinaryOperation } from './helpers';

/**
 * DIV/DIVIDE function - Divide two numbers
 */
export const div = createBinaryOperation(
  'DIV',
  (a, b) => a / b,
  (_a, b) => {
    if (b === 0) {
      throw new DivisionByZeroError();
    }
  }
);
