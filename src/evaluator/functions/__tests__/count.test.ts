import { describe, it, expect } from 'vitest';
import { count } from '../count';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

describe('COUNT function', () => {
  it('should count numeric values', () => {
    const result = count([1, 2, 3, 4, 5]);
    expect(result).toBe(5);
  });

  it('should count only numbers, not strings', () => {
    const result = count([1, 2, 'text', 3]);
    expect(result).toBe(3);
  });

  it('should count numeric strings', () => {
    const result = count(['1', '2', '3']);
    expect(result).toBe(3);
  });

  it('should count mixed numbers and numeric strings', () => {
    const result = count([1, '2', 3, 'text', '4']);
    expect(result).toBe(4);
  });

  it('should not count non-numeric strings', () => {
    const result = count(['abc', 'def', 'ghi']);
    expect(result).toBe(0);
  });

  it('should count zero as numeric', () => {
    const result = count([0, 1, 2]);
    expect(result).toBe(3);
  });

  it('should count negative numbers', () => {
    const result = count([-1, -2, -3]);
    expect(result).toBe(3);
  });

  it('should count decimal numbers', () => {
    const result = count([1.5, 2.5, 3.5]);
    expect(result).toBe(3);
  });

  it('should require at least one argument', () => {
    expect(() => count([])).toThrow(FunctionArgumentError);
    expect(() => count([])).toThrow('requires at least one argument');
  });

  it('should handle single numeric value', () => {
    const result = count([42]);
    expect(result).toBe(1);
  });

  it('should handle single text value', () => {
    const result = count(['text']);
    expect(result).toBe(0);
  });

  it('should count mixed types correctly', () => {
    const result = count([1, 'abc', 2, 'def', '3', 4, 'ghi', 5]);
    expect(result).toBe(5); // 1, 2, '3', 4, 5
  });

  it('should handle decimal string numbers', () => {
    const result = count(['1.5', '2.5', 'abc']);
    expect(result).toBe(2);
  });
});
