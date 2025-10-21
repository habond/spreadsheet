import { describe, it, expect } from 'vitest';
import { formatAsNumber } from '../format-number';

describe('formatAsNumber', () => {
  it('should format numbers with thousands separator and 2 decimals', () => {
    expect(formatAsNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should add .00 for whole numbers', () => {
    expect(formatAsNumber(1234)).toBe('1,234.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatAsNumber(1234.5678)).toBe('1,234.57');
  });

  it('should handle negative numbers', () => {
    expect(formatAsNumber(-1234.56)).toBe('-1,234.56');
  });

  it('should fall back to Raw for non-numeric values', () => {
    expect(formatAsNumber('not a number')).toBe('not a number');
  });

  it('should return empty string for null', () => {
    expect(formatAsNumber(null)).toBe('');
  });
});
