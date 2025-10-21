import { createUnaryStringOperation } from './helpers';

/**
 * TRIM function - Remove leading/trailing spaces
 */
export const trim = createUnaryStringOperation('TRIM', s => s.trim());
