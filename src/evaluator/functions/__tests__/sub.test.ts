import { describe, it, expect } from 'vitest';
import { sub } from '../sub';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('SUB function', () => {
  it('should subtract two positive numbers', () => {
    const result = sub([10, 3]);
    expect(result).toBe(7);
  });

  it('should subtract negative numbers', () => {
    const result = sub([-5, -3]);
    expect(result).toBe(-2);
  });

  it('should subtract positive and negative', () => {
    const result = sub([10, -3]);
    expect(result).toBe(13);
  });

  it('should subtract with zero', () => {
    const result = sub([5, 0]);
    expect(result).toBe(5);
  });

  it('should subtract from zero', () => {
    const result = sub([0, 5]);
    expect(result).toBe(-5);
  });

  it('should subtract decimal numbers', () => {
    const result = sub([5.5, 2.5]);
    expect(result).toBe(3);
  });

  it('should convert string numbers', () => {
    const result = sub(['10', '3']);
    expect(result).toBe(7);
  });

  it('should handle mixed numbers and strings', () => {
    const result = sub([10, '3']);
    expect(result).toBe(7);
  });

  it('should require exactly 2 arguments', () => {
    expect(() => sub([1])).toThrow(FunctionArgumentError);
    expect(() => sub([1])).toThrow('requires exactly 2 arguments');

    expect(() => sub([1, 2, 3])).toThrow(FunctionArgumentError);
    expect(() => sub([1, 2, 3])).toThrow('requires exactly 2 arguments');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => sub(['abc', 5])).toThrow(FormulaParseError);
    expect(() => sub(['abc', 5])).toThrow('Cannot convert');
  });
});
