import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs } from '../../types/core';
import { expand2DArray } from './helpers';

/**
 * COUNTIF function - Count cells that meet a criteria
 * Supports numeric comparisons (>, <, >=, <=, =, <>) and exact text matches
 */
export function countif(args: FunctionArgs): number {
  if (args.length !== 2) {
    throw new FunctionArgumentError('COUNTIF', 'requires exactly 2 arguments');
  }

  const rangeArg = args[0];
  const criteriaArg = args[1];

  // Range must be a 2D array
  if (!Array.isArray(rangeArg) || !Array.isArray(rangeArg[0])) {
    throw new FunctionArgumentError('COUNTIF', 'first argument must be a range');
  }

  // Expand 2D array to 1D
  const range = expand2DArray(rangeArg);
  const criteria = String(criteriaArg);

  // Parse criteria - check if it's a comparison operator
  // Note: <> must be checked before < to avoid partial match
  const comparisonMatch = criteria.match(/^(<>|>=?|<=?|=)(.+)$/);

  if (comparisonMatch) {
    // Comparison criteria (e.g., ">5", "<=10", "<>0")
    const operator = comparisonMatch[1];
    const comparisonValue = parseFloat(comparisonMatch[2]);

    if (isNaN(comparisonValue)) {
      throw new FunctionArgumentError('COUNTIF', `invalid comparison value: ${comparisonMatch[2]}`);
    }

    return range.filter(value => {
      if (typeof value !== 'number' && typeof value !== 'string') {
        return false;
      }
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) {
        return false;
      }

      switch (operator) {
        case '>':
          return numValue > comparisonValue;
        case '<':
          return numValue < comparisonValue;
        case '>=':
          return numValue >= comparisonValue;
        case '<=':
          return numValue <= comparisonValue;
        case '=':
          return numValue === comparisonValue;
        case '<>':
          return numValue !== comparisonValue;
        default:
          return false;
      }
    }).length;
  } else {
    // Exact match criteria (text or number)
    const numericCriteria = parseFloat(criteria);
    const isNumericCriteria = !isNaN(numericCriteria);

    return range.filter(value => {
      if (isNumericCriteria && typeof value === 'number') {
        return value === numericCriteria;
      }
      // String comparison (case-insensitive)
      return String(value).toLowerCase() === criteria.toLowerCase();
    }).length;
  }
}
