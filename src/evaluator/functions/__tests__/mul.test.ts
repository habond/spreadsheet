import { describe, it, expect } from 'vitest';
import { mul } from '../mul';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('MUL function', () => {
  it('should multiply two positive numbers', () => {
    const result = mul([4, 5]);
    expect(result).toBe(20);
  });

  it('should multiply negative numbers', () => {
    const result = mul([-4, -5]);
    expect(result).toBe(20);
  });

  it('should multiply positive and negative', () => {
    const result = mul([4, -5]);
    expect(result).toBe(-20);
  });

  it('should multiply with zero', () => {
    const result = mul([5, 0]);
    expect(result).toBe(0);
  });

  it('should multiply with one', () => {
    const result = mul([5, 1]);
    expect(result).toBe(5);
  });

  it('should multiply decimal numbers', () => {
    const result = mul([2.5, 4]);
    expect(result).toBe(10);
  });

  it('should multiply decimals', () => {
    const result = mul([0.5, 0.5]);
    expect(result).toBe(0.25);
  });

  it('should convert string numbers', () => {
    const result = mul(['4', '5']);
    expect(result).toBe(20);
  });

  it('should handle mixed numbers and strings', () => {
    const result = mul([4, '5']);
    expect(result).toBe(20);
  });

  it('should require exactly 2 arguments', () => {
    expect(() => mul([1])).toThrow(FunctionArgumentError);
    expect(() => mul([1])).toThrow('requires exactly 2 arguments');

    expect(() => mul([1, 2, 3])).toThrow(FunctionArgumentError);
    expect(() => mul([1, 2, 3])).toThrow('requires exactly 2 arguments');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => mul(['abc', 5])).toThrow(FormulaParseError);
    expect(() => mul(['abc', 5])).toThrow('Cannot convert');
  });
});
