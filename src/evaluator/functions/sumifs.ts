import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { FunctionArgs, CellValue } from '../../types/core';
import { toNumber, expand2DArray } from './helpers';

/**
 * SUMIFS function - Sum cells that meet multiple criteria
 * Syntax: SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)
 */
export function sumifs(args: FunctionArgs): number {
  // Must have at least sum_range, one criteria_range, and one criteria (3 arguments)
  // Additional criteria come in pairs, so total arguments must be odd
  if (args.length < 3 || args.length % 2 === 0) {
    throw new FunctionArgumentError(
      'SUMIFS',
      'requires sum_range and at least one criteria_range/criteria pair (odd number of arguments)'
    );
  }

  const sumRangeArg = args[0];

  // sumRange must be a 2D array
  if (!Array.isArray(sumRangeArg) || !Array.isArray(sumRangeArg[0])) {
    throw new FunctionArgumentError('SUMIFS', 'sum_range must be a range');
  }

  // Expand 2D array to 1D
  const sumRange = expand2DArray(sumRangeArg);
  const rangeSize = sumRange.length;

  // Parse criteria pairs
  const criteriaPairs: Array<{
    range: CellValue[];
    criteria: string;
    operator?: string;
    value?: number;
    isNumeric?: boolean;
  }> = [];

  for (let i = 1; i < args.length; i += 2) {
    const criteriaRangeArg = args[i];
    const criteriaArg = args[i + 1];

    if (!Array.isArray(criteriaRangeArg) || !Array.isArray(criteriaRangeArg[0])) {
      throw new FunctionArgumentError('SUMIFS', `criteria_range${(i + 1) / 2} must be a range`);
    }

    // Expand 2D array to 1D
    const criteriaRange = expand2DArray(criteriaRangeArg);
    const criteria = String(criteriaArg);

    if (criteriaRange.length !== rangeSize) {
      throw new FunctionArgumentError('SUMIFS', 'all ranges must be the same size');
    }

    // Parse criteria - check if it's a comparison operator
    // Note: <> must be checked before < to avoid partial match
    const comparisonMatch = criteria.match(/^(<>|>=?|<=?|=)(.+)$/);

    if (comparisonMatch) {
      const operator = comparisonMatch[1];
      const comparisonValue = parseFloat(comparisonMatch[2]);

      if (isNaN(comparisonValue)) {
        throw new FunctionArgumentError(
          'SUMIFS',
          `invalid comparison value: ${comparisonMatch[2]}`
        );
      }

      criteriaPairs.push({
        range: criteriaRange,
        criteria,
        operator,
        value: comparisonValue,
      });
    } else {
      // Exact match criteria
      const numericCriteria = parseFloat(criteria);
      const isNumericCriteria = !isNaN(numericCriteria);

      criteriaPairs.push({
        range: criteriaRange,
        criteria,
        isNumeric: isNumericCriteria,
        value: isNumericCriteria ? numericCriteria : undefined,
      });
    }
  }

  // Sum values where all criteria match
  let sum = 0;

  for (let i = 0; i < rangeSize; i++) {
    let allMatch = true;

    for (const pair of criteriaPairs) {
      const value = pair.range[i];
      let matches = false;

      if (pair.operator) {
        // Comparison criteria
        if (typeof value !== 'number' && typeof value !== 'string') {
          allMatch = false;
          break;
        }
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numValue)) {
          allMatch = false;
          break;
        }

        // When operator is set, value is guaranteed to be set (see line 74)
        const comparisonValue = pair.value as number;
        switch (pair.operator) {
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
      } else {
        // Exact match criteria
        if (pair.isNumeric && typeof value === 'number') {
          matches = value === pair.value;
        } else {
          // String comparison (case-insensitive)
          matches = String(value).toLowerCase() === pair.criteria.toLowerCase();
        }
      }

      if (!matches) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      sum += toNumber(sumRange[i]);
    }
  }

  return sum;
}
