import { describe, it, expect } from 'vitest';
import { formatAsRaw } from '../format-raw';

describe('formatAsRaw', () => {
  it('should display numbers as-is', () => {
    expect(formatAsRaw(12345)).toBe('12345');
  });

  it('should display strings as-is', () => {
    expect(formatAsRaw('hello')).toBe('hello');
  });

  it('should display timestamps as raw numbers', () => {
    const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
    expect(formatAsRaw(timestamp)).toBe(String(timestamp));
  });

  it('should return empty string for null', () => {
    expect(formatAsRaw(null)).toBe('');
  });
});
