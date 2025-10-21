import { describe, it, expect } from 'vitest';
import { formatAsBoolean } from '../format-boolean';

describe('formatAsBoolean', () => {
  it('should format 1 as True', () => {
    expect(formatAsBoolean(1)).toBe('True');
  });

  it('should format 0 as False', () => {
    expect(formatAsBoolean(0)).toBe('False');
  });

  it('should format string "1" as True', () => {
    expect(formatAsBoolean('1')).toBe('True');
  });

  it('should format string "0" as False', () => {
    expect(formatAsBoolean('0')).toBe('False');
  });

  it('should fall back to Raw for other numbers', () => {
    expect(formatAsBoolean(5)).toBe('5');
  });

  it('should fall back to Raw for non-boolean strings', () => {
    expect(formatAsBoolean('hello')).toBe('hello');
  });

  it('should work with comparison operator results', () => {
    // Comparison operators return 1 for true, 0 for false
    expect(formatAsBoolean(1)).toBe('True');
  });

  it('should return empty string for null', () => {
    expect(formatAsBoolean(null)).toBe('');
  });
});
