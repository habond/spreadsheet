import { createBinaryOperation } from './helpers';

/**
 * ADD function - Add two numbers
 */
export const add = createBinaryOperation('ADD', (a, b) => a + b);
