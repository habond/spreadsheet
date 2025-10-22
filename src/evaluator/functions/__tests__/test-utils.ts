import type { CellValue, CellRangeValues } from '../../../types/core';

/**
 * Test utility: Convert a 1D array to a 2D column array (single row)
 * This matches how the formula evaluator represents ranges
 *
 * @example
 * to2D([1, 2, 3]) → [[1, 2, 3]]
 */
export function to2D(arr: CellValue[]): CellRangeValues {
  return [arr];
}
