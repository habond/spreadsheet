import { FunctionArgumentError } from '../../errors/FunctionArgumentError';
import type { CellValueNullable, FunctionArgs } from '../../types/core';
import { requireRange, requireScalar, toNumber } from './helpers';

/**
 * MATCH - Find the position of a value in a range
 *
 * Syntax: MATCH(lookup_value, lookup_array, [match_type])
 *
 * @param lookup_value - The value to search for
 * @param lookup_array - The range to search in (must be 1D - single row or column)
 * @param match_type - Optional. 1 (default) = largest value <= lookup_value (sorted ascending)
 *                                 0 = exact match
 *                                 -1 = smallest value >= lookup_value (sorted descending)
 *
 * Returns: 1-based position of the match, or error if not found
 *
 * Examples:
 * - MATCH(5, A1:A10, 0) → finds exact position of 5 in range
 * - MATCH(7, A1:A10, 1) → finds position of largest value <= 7 (sorted ascending)
 * - MATCH(3, A1:A10, -1) → finds position of smallest value >= 3 (sorted descending)
 */
export function match(args: FunctionArgs): number | string {
  requireRange('MATCH', args, 2, 3);

  // Extract arguments - ensure they are scalars
  const lookupValue = args[0];
  requireScalar(lookupValue, 'MATCH', 'lookup_value');

  const lookupArray = args[1];

  let matchType = 1;
  if (args.length === 3) {
    const matchTypeArg = args[2];
    requireScalar(matchTypeArg, 'MATCH', 'match_type');
    matchType = toNumber(matchTypeArg);
  }

  // Validate match_type
  if (matchType !== -1 && matchType !== 0 && matchType !== 1) {
    throw new FunctionArgumentError('MATCH', 'match_type must be -1, 0, or 1');
  }

  // Flatten lookup array to 1D
  let flatArray: CellValueNullable[];
  if (Array.isArray(lookupArray)) {
    // 2D array - flatten it manually
    flatArray = [];
    for (const row of lookupArray) {
      if (Array.isArray(row)) {
        flatArray.push(...row);
      } else {
        flatArray.push(row);
      }
    }
  } else {
    flatArray = [lookupArray];
  }

  if (flatArray.length === 0) {
    throw new FunctionArgumentError('MATCH', 'lookup_array cannot be empty');
  }

  // Match type 0: Exact match
  if (matchType === 0) {
    const index = flatArray.findIndex(val => {
      // Handle numeric comparison
      if (typeof lookupValue === 'number' && typeof val === 'number') {
        return val === lookupValue;
      }
      // Handle string comparison (case-insensitive)
      if (typeof lookupValue === 'string' && typeof val === 'string') {
        return val.toLowerCase() === lookupValue.toLowerCase();
      }
      // Mixed types don't match
      return false;
    });

    if (index === -1) {
      throw new FunctionArgumentError('MATCH', `Value "${lookupValue}" not found in lookup_array`);
    }

    return index + 1; // 1-based position
  }

  // Match type 1: Largest value <= lookup_value (assumes sorted ascending)
  if (matchType === 1) {
    const numLookup = toNumber(lookupValue);
    let bestIndex = -1;

    for (let i = 0; i < flatArray.length; i++) {
      const val = flatArray[i];
      if (val === null) continue; // Skip empty cells

      const numVal = toNumber(val);
      if (numVal <= numLookup) {
        bestIndex = i;
      } else {
        // Since sorted ascending, we can stop
        break;
      }
    }

    if (bestIndex === -1) {
      throw new FunctionArgumentError(
        'MATCH',
        `No value <= "${lookupValue}" found in lookup_array`
      );
    }

    return bestIndex + 1; // 1-based position
  }

  // Match type -1: Smallest value >= lookup_value (assumes sorted descending)
  if (matchType === -1) {
    const numLookup = toNumber(lookupValue);
    let bestIndex = -1;

    for (let i = 0; i < flatArray.length; i++) {
      const val = flatArray[i];
      if (val === null) continue; // Skip empty cells

      const numVal = toNumber(val);
      if (numVal >= numLookup) {
        bestIndex = i;
      } else {
        // Since sorted descending, we can stop
        break;
      }
    }

    if (bestIndex === -1) {
      throw new FunctionArgumentError(
        'MATCH',
        `No value >= "${lookupValue}" found in lookup_array`
      );
    }

    return bestIndex + 1; // 1-based position
  }

  // This should never be reached due to validation above
  throw new FunctionArgumentError('MATCH', 'Invalid match_type');
}
