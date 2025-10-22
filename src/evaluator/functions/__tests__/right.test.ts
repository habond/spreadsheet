import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { right } from '../right';

describe('RIGHT function', () => {
  it('should extract characters from right', () => {
    const result = right(['Hello', 3]);
    expect(result).toBe('llo');
  });

  it('should extract single character', () => {
    const result = right(['Hello', 1]);
    expect(result).toBe('o');
  });

  it('should extract all characters if num exceeds length', () => {
    const result = right(['Hello', 10]);
    expect(result).toBe('Hello');
  });

  it('should return empty string for zero characters', () => {
    const result = right(['Hello', 0]);
    expect(result).toBe('');
  });

  it('should handle numeric input as string', () => {
    const result = right([12345, 3]);
    expect(result).toBe('345');
  });

  it('should handle string number for count', () => {
    const result = right(['Hello', '3']);
    expect(result).toBe('llo');
  });

  it('should handle empty string', () => {
    const result = right(['', 5]);
    expect(result).toBe('');
  });

  it('should handle spaces', () => {
    const result = right(['  Hello  ', 3]);
    expect(result).toBe('o  ');
  });

  it('should handle special characters', () => {
    const result = right(['Hello@World', 6]);
    expect(result).toBe('@World');
  });

  it('should require exactly 2 arguments', () => {
    expect(() => right(['Hello'])).toThrow(FunctionArgumentError);
    expect(() => right(['Hello'])).toThrow('requires exactly 2 arguments');

    expect(() => right(['Hello', 3, 'extra'])).toThrow(FunctionArgumentError);
  });

  it('should throw error for non-numeric count', () => {
    expect(() => right(['Hello', 'abc'])).toThrow(FormulaParseError);
    expect(() => right(['Hello', 'abc'])).toThrow('Cannot convert');
  });

  it('should handle negative count as zero', () => {
    const result = right(['Hello', -1]);
    expect(result).toBe('');
  });
});
