import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { min } from '../min';

describe('MIN function', () => {
  it('should find minimum of multiple numbers', () => {
    const result = min([5, 2, 8, 1, 9]);
    expect(result).toBe(1);
  });

  it('should find minimum of two numbers', () => {
    const result = min([10, 5]);
    expect(result).toBe(5);
  });

  it('should return single number', () => {
    const result = min([42]);
    expect(result).toBe(42);
  });

  it('should handle zero', () => {
    const result = min([5, 0, 10]);
    expect(result).toBe(0);
  });

  it('should handle negative numbers', () => {
    const result = min([-5, -10, -3]);
    expect(result).toBe(-10);
  });

  it('should handle mixed positive and negative', () => {
    const result = min([5, -3, 10, -7, 2]);
    expect(result).toBe(-7);
  });

  it('should handle decimal numbers', () => {
    const result = min([1.5, 2.3, 0.9, 3.1]);
    expect(result).toBe(0.9);
  });

  it('should convert string numbers', () => {
    const result = min(['10', '5', '15']);
    expect(result).toBe(5);
  });

  it('should handle mixed numbers and strings', () => {
    const result = min([10, '5', 15]);
    expect(result).toBe(5);
  });

  it('should require at least one argument', () => {
    expect(() => min([])).toThrow(FunctionArgumentError);
    expect(() => min([])).toThrow('requires at least one argument');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => min(['abc'])).toThrow(FormulaParseError);
    expect(() => min(['abc'])).toThrow('Cannot convert');
  });

  it('should handle all same values', () => {
    const result = min([5, 5, 5, 5]);
    expect(result).toBe(5);
  });
});
