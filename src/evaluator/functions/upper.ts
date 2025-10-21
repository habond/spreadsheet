import { createUnaryStringOperation } from './helpers';

/**
 * UPPER function - Convert text to uppercase
 */
export const upper = createUnaryStringOperation('UPPER', s => s.toUpperCase());
