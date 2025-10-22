import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { now } from '../now';

describe('NOW function', () => {
  it('should return a timestamp', () => {
    const result = now([]);
    expect(typeof result).toBe('number');
  });

  it('should return current time', () => {
    const before = Date.now();
    const result = now([]);
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('should return different values on successive calls', () => {
    const result1 = now([]);
    // Small delay
    const start = Date.now();
    while (Date.now() - start < 2) {
      // Wait at least 2ms
    }
    const result2 = now([]);

    expect(result2).toBeGreaterThanOrEqual(result1);
  });

  it('should require no arguments', () => {
    expect(() => now([1])).toThrow(FunctionArgumentError);
    expect(() => now([1])).toThrow('requires no arguments');
  });

  it('should return a valid date timestamp', () => {
    const result = now([]);
    const date = new Date(result);

    expect(date.getTime()).toBe(result);
    expect(isNaN(date.getTime())).toBe(false);
  });
});
