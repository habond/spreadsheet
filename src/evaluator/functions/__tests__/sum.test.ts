import { describe, it, expect } from 'vitest';
import { sum } from '../sum';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('SUM function', () => {
  it('should sum multiple numbers', () => {
    const result = sum([1, 2, 3, 4, 5]);
    expect(result).toBe(15);
  });

  it('should sum two numbers', () => {
    const result = sum([10, 20]);
    expect(result).toBe(30);
  });

  it('should sum a single number', () => {
    const result = sum([42]);
    expect(result).toBe(42);
  });

  it('should sum with zero', () => {
    const result = sum([5, 0, 3]);
    expect(result).toBe(8);
  });

  it('should sum negative numbers', () => {
    const result = sum([-5, 10, -3]);
    expect(result).toBe(2);
  });

  it('should sum decimal numbers', () => {
    const result = sum([1.5, 2.5, 3]);
    expect(result).toBe(7);
  });

  it('should convert string numbers', () => {
    const result = sum(['5', '10', '15']);
    expect(result).toBe(30);
  });

  it('should handle mixed numbers and strings', () => {
    const result = sum([5, '10', 15]);
    expect(result).toBe(30);
  });

  it('should require at least one argument', () => {
    expect(() => sum([])).toThrow(FunctionArgumentError);
    expect(() => sum([])).toThrow('requires at least one argument');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => sum(['abc'])).toThrow(FormulaParseError);
    expect(() => sum(['abc'])).toThrow('Cannot convert');
  });

  it('should handle large numbers', () => {
    const result = sum([1000000, 2000000, 3000000]);
    expect(result).toBe(6000000);
  });
});
