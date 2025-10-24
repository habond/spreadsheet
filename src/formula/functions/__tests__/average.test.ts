import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { average } from '../average';

describe('AVERAGE function', () => {
  it('should calculate average of multiple numbers', () => {
    const result = average([2, 4, 6, 8]);
    expect(result).toBe(5);
  });

  it('should calculate average of two numbers', () => {
    const result = average([10, 20]);
    expect(result).toBe(15);
  });

  it('should calculate average of a single number', () => {
    const result = average([42]);
    expect(result).toBe(42);
  });

  it('should handle zero in average', () => {
    const result = average([0, 10, 20]);
    expect(result).toBe(10);
  });

  it('should handle negative numbers', () => {
    const result = average([-10, 0, 10]);
    expect(result).toBe(0);
  });

  it('should handle decimal numbers', () => {
    const result = average([1.5, 2.5, 3]);
    expect(result).toBe(2.3333333333333335);
  });

  it('should convert string numbers', () => {
    const result = average(['10', '20', '30']);
    expect(result).toBe(20);
  });

  it('should handle mixed numbers and strings', () => {
    const result = average([10, '20', 30]);
    expect(result).toBe(20);
  });

  it('should require at least one argument', () => {
    expect(() => average([])).toThrow(FunctionArgumentError);
    expect(() => average([])).toThrow('requires at least one argument');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => average(['abc'])).toThrow(FormulaParseError);
    expect(() => average(['abc'])).toThrow('Cannot convert');
  });

  it('should handle uneven division', () => {
    const result = average([1, 2, 3]);
    expect(result).toBeCloseTo(2, 5);
  });
});
