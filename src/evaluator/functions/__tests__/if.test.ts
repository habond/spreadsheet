import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { ifFunction } from '../if';

describe('IF function', () => {
  it('should return value_if_true when condition is true (number)', () => {
    const result = ifFunction([1, 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should return value_if_false when condition is false (number)', () => {
    const result = ifFunction([0, 'yes', 'no']);
    expect(result).toBe('no');
  });

  it('should handle string "true"', () => {
    const result = ifFunction(['true', 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should handle string "false"', () => {
    const result = ifFunction(['false', 'yes', 'no']);
    expect(result).toBe('no');
  });

  it('should handle string "1"', () => {
    const result = ifFunction(['1', 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should handle string "0"', () => {
    const result = ifFunction(['0', 'yes', 'no']);
    expect(result).toBe('no');
  });

  it('should handle empty string as false', () => {
    const result = ifFunction(['', 'yes', 'no']);
    expect(result).toBe('no');
  });

  it('should handle non-empty string as true', () => {
    const result = ifFunction(['hello', 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should return numeric values', () => {
    const result = ifFunction([1, 100, 200]);
    expect(result).toBe(100);
  });

  it('should handle negative numbers as true', () => {
    const result = ifFunction([-1, 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should handle positive numbers as true', () => {
    const result = ifFunction([5, 'yes', 'no']);
    expect(result).toBe('yes');
  });

  it('should return mixed types', () => {
    const result = ifFunction([1, 42, 'no']);
    expect(result).toBe(42);
  });

  it('should require exactly 3 arguments', () => {
    expect(() => ifFunction([1, 'yes'])).toThrow(FunctionArgumentError);
    expect(() => ifFunction([1, 'yes'])).toThrow('requires exactly 3 arguments');

    expect(() => ifFunction([1, 'yes', 'no', 'extra'])).toThrow(FunctionArgumentError);
    expect(() => ifFunction([1, 'yes', 'no', 'extra'])).toThrow('requires exactly 3 arguments');
  });

  it('should handle nested scenarios (condition as expression result)', () => {
    // Simulating IF(1 > 0, "yes", "no") where 1 > 0 returns 1
    const result = ifFunction([1, 'yes', 'no']);
    expect(result).toBe('yes');
  });
});
