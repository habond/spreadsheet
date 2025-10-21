import { describe, it, expect } from 'vitest';
import { formatAsPercentage } from '../format-percentage';

describe('formatAsPercentage', () => {
  it('should multiply by 100 and add % sign', () => {
    expect(formatAsPercentage(0.75)).toBe('75.00%');
  });

  it('should handle whole numbers', () => {
    expect(formatAsPercentage(1)).toBe('100.00%');
  });

  it('should handle values greater than 1', () => {
    expect(formatAsPercentage(2.5)).toBe('250.00%');
  });

  it('should handle negative percentages', () => {
    expect(formatAsPercentage(-0.25)).toBe('-25.00%');
  });

  it('should round to 2 decimal places', () => {
    expect(formatAsPercentage(0.12345)).toBe('12.35%');
  });

  it('should fall back to Raw for non-numeric values', () => {
    expect(formatAsPercentage('not a number')).toBe('not a number');
  });

  it('should return empty string for null', () => {
    expect(formatAsPercentage(null)).toBe('');
  });
});
