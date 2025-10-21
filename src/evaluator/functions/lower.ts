import { createUnaryStringOperation } from './helpers';

/**
 * LOWER function - Convert text to lowercase
 */
export const lower = createUnaryStringOperation('LOWER', s => s.toLowerCase());
