import { describe, it, expect } from 'vitest';
import { formatAsCurrency } from '../format-currency';

describe('formatAsCurrency', () => {
  it('should format numbers as USD currency', () => {
    expect(formatAsCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle negative amounts', () => {
    expect(formatAsCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should add .00 for whole numbers', () => {
    expect(formatAsCurrency(100)).toBe('$100.00');
  });

  it('should handle zero', () => {
    expect(formatAsCurrency(0)).toBe('$0.00');
  });

  it('should fall back to Raw for non-numeric values', () => {
    expect(formatAsCurrency('not a number')).toBe('not a number');
  });

  it('should return empty string for null', () => {
    expect(formatAsCurrency(null)).toBe('');
  });
});
