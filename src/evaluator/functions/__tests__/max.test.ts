import { describe, it, expect } from 'vitest';
import { max } from '../max';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('MAX function', () => {
  it('should find maximum of multiple numbers', () => {
    const result = max([5, 2, 8, 1, 9]);
    expect(result).toBe(9);
  });

  it('should find maximum of two numbers', () => {
    const result = max([10, 5]);
    expect(result).toBe(10);
  });

  it('should return single number', () => {
    const result = max([42]);
    expect(result).toBe(42);
  });

  it('should handle zero', () => {
    const result = max([5, 0, 10]);
    expect(result).toBe(10);
  });

  it('should handle negative numbers', () => {
    const result = max([-5, -10, -3]);
    expect(result).toBe(-3);
  });

  it('should handle mixed positive and negative', () => {
    const result = max([5, -3, 10, -7, 2]);
    expect(result).toBe(10);
  });

  it('should handle decimal numbers', () => {
    const result = max([1.5, 2.3, 0.9, 3.1]);
    expect(result).toBe(3.1);
  });

  it('should convert string numbers', () => {
    const result = max(['10', '5', '15']);
    expect(result).toBe(15);
  });

  it('should handle mixed numbers and strings', () => {
    const result = max([10, '5', 15]);
    expect(result).toBe(15);
  });

  it('should require at least one argument', () => {
    expect(() => max([])).toThrow(FunctionArgumentError);
    expect(() => max([])).toThrow('requires at least one argument');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => max(['abc'])).toThrow(FormulaParseError);
    expect(() => max(['abc'])).toThrow('Cannot convert');
  });

  it('should handle all same values', () => {
    const result = max([5, 5, 5, 5]);
    expect(result).toBe(5);
  });
});
