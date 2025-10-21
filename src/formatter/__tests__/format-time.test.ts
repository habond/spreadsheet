import { describe, it, expect } from 'vitest';
import { formatAsTime } from '../format-time';

describe('formatAsTime', () => {
  it('should format timestamps as 12-hour time', () => {
    // Create a timestamp for 2:30:45 PM
    const date = new Date(2024, 0, 1, 14, 30, 45);
    expect(formatAsTime(date.getTime())).toBe('2:30:45 PM');
  });

  it('should handle midnight', () => {
    const date = new Date(2024, 0, 1, 0, 0, 0);
    expect(formatAsTime(date.getTime())).toBe('12:00:00 AM');
  });

  it('should handle noon', () => {
    const date = new Date(2024, 0, 1, 12, 0, 0);
    expect(formatAsTime(date.getTime())).toBe('12:00:00 PM');
  });

  it('should work with NOW() function results', () => {
    const now = new Date();
    // Just check that it has the right format
    const displayValue = formatAsTime(now.getTime());
    expect(displayValue).toMatch(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/);
  });

  it('should fall back to Raw for non-numeric values', () => {
    expect(formatAsTime('not a number')).toBe('not a number');
  });

  it('should fall back to Raw for invalid dates', () => {
    expect(formatAsTime(NaN)).toBe('NaN');
  });

  it('should return empty string for null', () => {
    expect(formatAsTime(null)).toBe('');
  });
});
