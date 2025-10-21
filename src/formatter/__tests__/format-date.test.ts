import { describe, it, expect } from 'vitest';
import { formatAsDate } from '../format-date';

describe('formatAsDate', () => {
  it('should format timestamps as mm/dd/yyyy', () => {
    const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
    // Note: The exact date depends on timezone, so we just check format
    const displayValue = formatAsDate(timestamp);
    expect(displayValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('should format DATE() function results', () => {
    const date = new Date(2024, 2, 15).getTime(); // March 15, 2024
    expect(formatAsDate(date)).toBe('03/15/2024');
  });

  it('should format TODAY() function results', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    expect(formatAsDate(today.getTime())).toBe(`${month}/${day}/${year}`);
  });

  it('should fall back to Raw for non-numeric values', () => {
    expect(formatAsDate('not a number')).toBe('not a number');
  });

  it('should fall back to Raw for invalid dates', () => {
    expect(formatAsDate(NaN)).toBe('NaN');
  });

  it('should return empty string for null', () => {
    expect(formatAsDate(null)).toBe('');
  });
});
