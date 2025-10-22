import { FunctionInfo, FunctionArgs, CellValue } from '../../types/core';
import { InvalidFunctionError } from '../../errors/InvalidFunctionError';

// Import all function implementations
import { sum } from './sum';
import { average } from './average';
import { min } from './min';
import { max } from './max';
import { add } from './add';
import { sub } from './sub';
import { mul } from './mul';
import { div } from './div';
import { count } from './count';
import { ifFunction } from './if';
import { concatenate } from './concatenate';
import { left } from './left';
import { right } from './right';
import { trim } from './trim';
import { upper } from './upper';
import { lower } from './lower';
import { now } from './now';
import { today } from './today';
import { date } from './date';
import { datedif } from './datedif';
import { countif } from './countif';
import { sumif } from './sumif';
import { sumifs } from './sumifs';
import { vlookup } from './vlookup';

/**
 * Function name constants for type safety
 */
export const FunctionName = {
  // Math functions
  SUM: 'SUM',
  AVERAGE: 'AVERAGE',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
  ADD: 'ADD',
  SUB: 'SUB',
  MUL: 'MUL',
  MULTIPLY: 'MULTIPLY',
  DIV: 'DIV',
  DIVIDE: 'DIVIDE',
  // Logical functions
  IF: 'IF',
  // Count functions
  COUNT: 'COUNT',
  COUNTIF: 'COUNTIF',
  // Conditional sum functions
  SUMIF: 'SUMIF',
  SUMIFS: 'SUMIFS',
  // Lookup functions
  VLOOKUP: 'VLOOKUP',
  // String functions
  CONCATENATE: 'CONCATENATE',
  CONCAT: 'CONCAT',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TRIM: 'TRIM',
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  // Date/time functions
  NOW: 'NOW',
  TODAY: 'TODAY',
  DATE: 'DATE',
  DATEDIF: 'DATEDIF',
} as const;

export type FunctionNameType = (typeof FunctionName)[keyof typeof FunctionName];

/**
 * Metadata for all supported spreadsheet functions
 */
export const SUPPORTED_FUNCTIONS: FunctionInfo[] = [
  // Math functions
  { name: FunctionName.SUM, description: 'Add all arguments' },
  {
    name: FunctionName.AVERAGE,
    description: 'Calculate average of arguments',
    aliases: [FunctionName.AVG],
  },
  { name: FunctionName.MIN, description: 'Find minimum value' },
  { name: FunctionName.MAX, description: 'Find maximum value' },
  { name: FunctionName.ADD, description: 'Add two numbers' },
  { name: FunctionName.SUB, description: 'Subtract two numbers' },
  { name: FunctionName.MUL, description: 'Multiply two numbers', aliases: [FunctionName.MULTIPLY] },
  { name: FunctionName.DIV, description: 'Divide two numbers', aliases: [FunctionName.DIVIDE] },
  // Logical functions
  { name: FunctionName.IF, description: 'IF(condition, value_if_true, value_if_false)' },
  // Count functions
  { name: FunctionName.COUNT, description: 'Count numeric values' },
  { name: FunctionName.COUNTIF, description: 'COUNTIF(range, criteria) - Count cells matching criteria' },
  // Conditional sum functions
  { name: FunctionName.SUMIF, description: 'SUMIF(range, criteria, [sum_range])' },
  { name: FunctionName.SUMIFS, description: 'SUMIFS(sum_range, criteria_range1, criteria1, ...)' },
  // Lookup functions
  { name: FunctionName.VLOOKUP, description: 'VLOOKUP(lookup_value, table_range, col_index_num, [range_lookup])' },
  // String functions
  { name: FunctionName.CONCATENATE, description: 'Join text strings' },
  { name: FunctionName.CONCAT, description: 'Join text strings (alias)' },
  { name: FunctionName.LEFT, description: 'LEFT(text, num_chars) - Extract from left' },
  { name: FunctionName.RIGHT, description: 'RIGHT(text, num_chars) - Extract from right' },
  { name: FunctionName.TRIM, description: 'Remove leading/trailing spaces' },
  { name: FunctionName.UPPER, description: 'Convert text to uppercase' },
  { name: FunctionName.LOWER, description: 'Convert text to lowercase' },
  // Date/time functions
  { name: FunctionName.NOW, description: 'Current date and time as timestamp' },
  { name: FunctionName.TODAY, description: 'Current date as timestamp' },
  { name: FunctionName.DATE, description: 'DATE(year, month, day)' },
  { name: FunctionName.DATEDIF, description: 'DATEDIF(start, end, unit)' },
];

/**
 * Execute a built-in spreadsheet function
 * Args can be scalars (number/string) or 2D arrays from cell refs/ranges
 */
export function executeFunction(name: string, args: FunctionArgs): CellValue {
  const upperName = name.toUpperCase();

  // Validate function name before executing
  const validFunctions = Object.values(FunctionName);
  if (!validFunctions.includes(upperName as FunctionNameType)) {
    throw new InvalidFunctionError(name);
  }

  switch (upperName as FunctionNameType) {
    // Math functions
    case FunctionName.SUM:
      return sum(args);
    case FunctionName.AVERAGE:
    case FunctionName.AVG:
      return average(args);
    case FunctionName.MIN:
      return min(args);
    case FunctionName.MAX:
      return max(args);
    case FunctionName.ADD:
      return add(args);
    case FunctionName.SUB:
      return sub(args);
    case FunctionName.MUL:
    case FunctionName.MULTIPLY:
      return mul(args);
    case FunctionName.DIV:
    case FunctionName.DIVIDE:
      return div(args);
    case FunctionName.COUNT:
      return count(args);
    case FunctionName.COUNTIF:
      return countif(args);

    // Conditional sum functions
    case FunctionName.SUMIF:
      return sumif(args);
    case FunctionName.SUMIFS:
      return sumifs(args);

    // Lookup functions
    case FunctionName.VLOOKUP:
      return vlookup(args);

    // Logical functions
    case FunctionName.IF:
      return ifFunction(args);

    // String functions
    case FunctionName.CONCATENATE:
    case FunctionName.CONCAT:
      return concatenate(args);
    case FunctionName.LEFT:
      return left(args);
    case FunctionName.RIGHT:
      return right(args);
    case FunctionName.TRIM:
      return trim(args);
    case FunctionName.UPPER:
      return upper(args);
    case FunctionName.LOWER:
      return lower(args);

    // Date/time functions
    case FunctionName.NOW:
      return now(args);
    case FunctionName.TODAY:
      return today(args);
    case FunctionName.DATE:
      return date(args);
    case FunctionName.DATEDIF:
      return datedif(args);

    default:
      throw new InvalidFunctionError(name);
  }
}

// Re-export helpers
export { expandArgs, expand2DArray, toNumber, toBoolean } from './helpers';
