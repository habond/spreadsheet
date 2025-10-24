import { createBinaryOperation } from './helpers';

/**
 * MUL/MULTIPLY function - Multiply two numbers
 */
export const mul = createBinaryOperation('MUL', (a, b) => a * b);
