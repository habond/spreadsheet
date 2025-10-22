import { describe, it, expect } from 'vitest';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { left } from '../left';

describe('LEFT function', () => {
  it('should extract characters from left', () => {
    const result = left(['Hello', 3]);
    expect(result).toBe('Hel');
  });

  it('should extract single character', () => {
    const result = left(['Hello', 1]);
    expect(result).toBe('H');
  });

  it('should extract all characters if num exceeds length', () => {
    const result = left(['Hello', 10]);
    expect(result).toBe('Hello');
  });

  it('should return empty string for zero characters', () => {
    const result = left(['Hello', 0]);
    expect(result).toBe('');
  });

  it('should handle numeric input as string', () => {
    const result = left([12345, 3]);
    expect(result).toBe('123');
  });

  it('should handle string number for count', () => {
    const result = left(['Hello', '3']);
    expect(result).toBe('Hel');
  });

  it('should handle empty string', () => {
    const result = left(['', 5]);
    expect(result).toBe('');
  });

  it('should handle spaces', () => {
    const result = left(['  Hello  ', 3]);
    expect(result).toBe('  H');
  });

  it('should handle special characters', () => {
    const result = left(['Hello@World', 6]);
    expect(result).toBe('Hello@');
  });

  it('should require exactly 2 arguments', () => {
    expect(() => left(['Hello'])).toThrow(FunctionArgumentError);
    expect(() => left(['Hello'])).toThrow('requires exactly 2 arguments');

    expect(() => left(['Hello', 3, 'extra'])).toThrow(FunctionArgumentError);
  });

  it('should throw error for non-numeric count', () => {
    expect(() => left(['Hello', 'abc'])).toThrow(FormulaParseError);
    expect(() => left(['Hello', 'abc'])).toThrow('Cannot convert');
  });

  it('should handle negative count as zero', () => {
    const result = left(['Hello', -1]);
    expect(result).toBe('');
  });
});
