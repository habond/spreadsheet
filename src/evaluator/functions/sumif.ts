import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { FunctionArgs } from '../../types/core';
import { toNumber, expand2DArray } from './helpers';

/**
 * SUMIF function - Sum cells that meet a criteria
 * Supports numeric comparisons (>, <, >=, <=, =, <>) and exact text matches
 */
export function sumif(args: FunctionArgs): number {
  if (args.length < 2 || args.length > 3) {
    throw new FunctionArgumentError('SUMIF', 'requires 2 or 3 arguments');
  }

  const rangeArg = args[0];
  const criteriaArg = args[1];
  const sumRangeArg = args.length === 3 ? args[2] : rangeArg;

  // Both range and sumRange must be 2D arrays
  if (!Array.isArray(rangeArg) || !Array.isArray(rangeArg[0])) {
    throw new FunctionArgumentError('SUMIF', 'first argument must be a range');
  }
  if (!Array.isArray(sumRangeArg) || !Array.isArray(sumRangeArg[0])) {
    throw new FunctionArgumentError('SUMIF', 'sum_range must be a range');
  }

  // Expand 2D arrays to 1D
  const range = expand2DArray(rangeArg);
  const sumRange = expand2DArray(sumRangeArg);
  const criteria = String(criteriaArg);

  // If sumRange is provided, it must be the same size as range
  if (args.length === 3 && range.length !== sumRange.length) {
    throw new FunctionArgumentError('SUMIF', 'range and sum_range must be the same size');
  }

  // Parse criteria - check if it's a comparison operator
  // Note: <> must be checked before < to avoid partial match
  const comparisonMatch = criteria.match(/^(<>|>=?|<=?|=)(.+)$/);

  let sum = 0;

  if (comparisonMatch) {
    // Comparison criteria (e.g., ">5", "<=10", "<>0")
    const operator = comparisonMatch[1];
    const comparisonValue = parseFloat(comparisonMatch[2]);

    if (isNaN(comparisonValue)) {
      throw new FunctionArgumentError('SUMIF', `invalid comparison value: ${comparisonMatch[2]}`);
    }

    for (let i = 0; i < range.length; i++) {
      const value = range[i];
      if (typeof value !== 'number' && typeof value !== 'string') {
        continue;
      }
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) {
        continue;
      }

      let matches = false;
      switch (operator) {
        case '>':
          matches = numValue > comparisonValue;
          break;
        case '<':
          matches = numValue < comparisonValue;
          break;
        case '>=':
          matches = numValue >= comparisonValue;
          break;
        case '<=':
          matches = numValue <= comparisonValue;
          break;
        case '=':
          matches = numValue === comparisonValue;
          break;
        case '<>':
          matches = numValue !== comparisonValue;
          break;
      }

      if (matches) {
        sum += toNumber(sumRange[i]);
      }
    }
  } else {
    // Exact match criteria (text or number)
    const numericCriteria = parseFloat(criteria);
    const isNumericCriteria = !isNaN(numericCriteria);

    for (let i = 0; i < range.length; i++) {
      const value = range[i];
      let matches = false;

      if (isNumericCriteria && typeof value === 'number') {
        matches = value === numericCriteria;
      } else {
        // String comparison (case-insensitive)
        matches = String(value).toLowerCase() === criteria.toLowerCase();
      }

      if (matches) {
        sum += toNumber(sumRange[i]);
      }
    }
  }

  return sum;
}
