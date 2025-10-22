import { describe, it, expect } from 'vitest';
import { date } from '../date';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('DATE function', () => {
  it('should create date from year, month, day', () => {
    const result = date([2024, 3, 15]);
    const resultDate = new Date(result);

    expect(resultDate.getFullYear()).toBe(2024);
    expect(resultDate.getMonth()).toBe(2); // Month is 0-indexed
    expect(resultDate.getDate()).toBe(15);
  });

  it('should handle string arguments', () => {
    const result = date(['2024', '3', '15']);
    const resultDate = new Date(result);

    expect(resultDate.getFullYear()).toBe(2024);
    expect(resultDate.getMonth()).toBe(2);
    expect(resultDate.getDate()).toBe(15);
  });

  it('should create date at midnight', () => {
    const result = date([2024, 3, 15]);
    const resultDate = new Date(result);

    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
    expect(resultDate.getSeconds()).toBe(0);
    expect(resultDate.getMilliseconds()).toBe(0);
  });

  it('should handle January (month 1)', () => {
    const result = date([2024, 1, 1]);
    const resultDate = new Date(result);

    expect(resultDate.getMonth()).toBe(0); // January is 0
  });

  it('should handle December (month 12)', () => {
    const result = date([2024, 12, 31]);
    const resultDate = new Date(result);

    expect(resultDate.getMonth()).toBe(11); // December is 11
  });

  it('should handle leap year', () => {
    const result = date([2024, 2, 29]); // 2024 is a leap year
    const resultDate = new Date(result);

    expect(resultDate.getDate()).toBe(29);
    expect(resultDate.getMonth()).toBe(1);
  });

  it('should handle first day of year', () => {
    const result = date([2024, 1, 1]);
    const resultDate = new Date(result);

    expect(resultDate.getMonth()).toBe(0);
    expect(resultDate.getDate()).toBe(1);
  });

  it('should handle last day of year', () => {
    const result = date([2024, 12, 31]);
    const resultDate = new Date(result);

    expect(resultDate.getMonth()).toBe(11);
    expect(resultDate.getDate()).toBe(31);
  });

  it('should require exactly 3 arguments', () => {
    expect(() => date([2024, 3])).toThrow(FunctionArgumentError);
    expect(() => date([2024, 3])).toThrow('requires exactly 3 arguments');

    expect(() => date([2024, 3, 15, 12])).toThrow(FunctionArgumentError);
  });

  it('should throw error for non-numeric year', () => {
    expect(() => date(['abc', 3, 15])).toThrow(FormulaParseError);
    expect(() => date(['abc', 3, 15])).toThrow('Cannot convert');
  });

  it('should return a valid timestamp', () => {
    const result = date([2024, 3, 15]);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('should handle old dates', () => {
    const result = date([1900, 1, 1]);
    const resultDate = new Date(result);

    expect(resultDate.getFullYear()).toBe(1900);
  });

  it('should handle future dates', () => {
    const result = date([2100, 12, 31]);
    const resultDate = new Date(result);

    expect(resultDate.getFullYear()).toBe(2100);
  });
});
