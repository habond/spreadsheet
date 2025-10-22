import { FunctionArgumentError } from '../../errors/FunctionArgumentError';

/**
 * COUNTIF function - Count cells that meet a criteria
 * Supports numeric comparisons (>, <, >=, <=, =, <>) and exact text matches
 */
export function countif(args: (number | string | (number | string)[])[]): number {
  if (args.length !== 2) {
    throw new FunctionArgumentError('COUNTIF', 'requires exactly 2 arguments');
  }

  const range = args[0];
  const criteria = String(args[1]);

  // Range must be an array
  if (!Array.isArray(range)) {
    throw new FunctionArgumentError('COUNTIF', 'first argument must be a range');
  }

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

    return range.filter((value) => {
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

    return range.filter((value) => {
      if (isNumericCriteria && typeof value === 'number') {
        return value === numericCriteria;
      }
      // String comparison (case-insensitive)
      return String(value).toLowerCase() === criteria.toLowerCase();
    }).length;
  }
}
