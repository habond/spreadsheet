import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import { toNumber } from './helpers';

/**
 * SUMIFS function - Sum cells that meet multiple criteria
 * Syntax: SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)
 */
export function sumifs(args: (number | string | (number | string)[])[]): number {
  // Must have at least sum_range, one criteria_range, and one criteria (3 arguments)
  // Additional criteria come in pairs, so total arguments must be odd
  if (args.length < 3 || args.length % 2 === 0) {
    throw new FunctionArgumentError(
      'SUMIFS',
      'requires sum_range and at least one criteria_range/criteria pair (odd number of arguments)'
    );
  }

  const sumRange = args[0];

  // sumRange must be an array
  if (!Array.isArray(sumRange)) {
    throw new FunctionArgumentError('SUMIFS', 'sum_range must be a range');
  }

  const rangeSize = sumRange.length;

  // Parse criteria pairs
  const criteriaPairs: Array<{
    range: (number | string)[];
    criteria: string;
    operator?: string;
    value?: number;
    isNumeric?: boolean;
  }> = [];

  for (let i = 1; i < args.length; i += 2) {
    const criteriaRange = args[i];
    const criteria = String(args[i + 1]);

    if (!Array.isArray(criteriaRange)) {
      throw new FunctionArgumentError('SUMIFS', `criteria_range${(i + 1) / 2} must be a range`);
    }

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
        throw new FunctionArgumentError('SUMIFS', `invalid comparison value: ${comparisonMatch[2]}`);
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

        switch (pair.operator) {
          case '>':
            matches = numValue > pair.value!;
            break;
          case '<':
            matches = numValue < pair.value!;
            break;
          case '>=':
            matches = numValue >= pair.value!;
            break;
          case '<=':
            matches = numValue <= pair.value!;
            break;
          case '=':
            matches = numValue === pair.value!;
            break;
          case '<>':
            matches = numValue !== pair.value!;
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
