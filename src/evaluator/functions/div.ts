import { DivisionByZeroError } from '../../errors/DivisionByZeroError';
import { createBinaryOperation } from './helpers';

/**
 * DIV/DIVIDE function - Divide two numbers
 */
export const div = createBinaryOperation(
  'DIV',
  (a, b) => a / b,
  (a, b) => {
    if (b === 0) {
      throw new DivisionByZeroError();
    }
  }
);
