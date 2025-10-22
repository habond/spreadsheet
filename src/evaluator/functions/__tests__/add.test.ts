import { describe, it, expect } from 'vitest';
import { add } from '../add';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('ADD function', () => {
  it('should add two positive numbers', () => {
    const result = add([5, 3]);
    expect(result).toBe(8);
  });

  it('should add negative numbers', () => {
    const result = add([-5, -3]);
    expect(result).toBe(-8);
  });

  it('should add positive and negative', () => {
    const result = add([10, -3]);
    expect(result).toBe(7);
  });

  it('should add with zero', () => {
    const result = add([5, 0]);
    expect(result).toBe(5);
  });

  it('should add decimal numbers', () => {
    const result = add([1.5, 2.5]);
    expect(result).toBe(4);
  });

  it('should convert string numbers', () => {
    const result = add(['5', '3']);
    expect(result).toBe(8);
  });

  it('should handle mixed numbers and strings', () => {
    const result = add([5, '3']);
    expect(result).toBe(8);
  });

  it('should require exactly 2 arguments', () => {
    expect(() => add([1])).toThrow(FunctionArgumentError);
    expect(() => add([1])).toThrow('requires exactly 2 arguments');

    expect(() => add([1, 2, 3])).toThrow(FunctionArgumentError);
    expect(() => add([1, 2, 3])).toThrow('requires exactly 2 arguments');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => add(['abc', 5])).toThrow(FormulaParseError);
    expect(() => add(['abc', 5])).toThrow('Cannot convert');
  });
});
