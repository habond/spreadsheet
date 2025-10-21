import { createBinaryOperation } from './helpers';

/**
 * SUB function - Subtract two numbers
 */
export const sub = createBinaryOperation('SUB', (a, b) => a - b);
