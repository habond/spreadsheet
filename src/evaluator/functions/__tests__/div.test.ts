import { describe, it, expect } from 'vitest';
import { div } from '../div';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';
import { DivisionByZeroError } from '../../../errors/DivisionByZeroError';

describe('DIV function', () => {
  it('should divide two positive numbers', () => {
    const result = div([20, 4]);
    expect(result).toBe(5);
  });

  it('should divide negative numbers', () => {
    const result = div([-20, -4]);
    expect(result).toBe(5);
  });

  it('should divide positive and negative', () => {
    const result = div([20, -4]);
    expect(result).toBe(-5);
  });

  it('should divide by one', () => {
    const result = div([5, 1]);
    expect(result).toBe(5);
  });

  it('should divide zero by number', () => {
    const result = div([0, 5]);
    expect(result).toBe(0);
  });

  it('should divide decimal numbers', () => {
    const result = div([10, 2.5]);
    expect(result).toBe(4);
  });

  it('should handle decimal results', () => {
    const result = div([10, 3]);
    expect(result).toBeCloseTo(3.333333, 5);
  });

  it('should convert string numbers', () => {
    const result = div(['20', '4']);
    expect(result).toBe(5);
  });

  it('should handle mixed numbers and strings', () => {
    const result = div([20, '4']);
    expect(result).toBe(5);
  });

  it('should throw error for division by zero', () => {
    expect(() => div([10, 0])).toThrow(DivisionByZeroError);
    expect(() => div([10, 0])).toThrow('Division by zero');
  });

  it('should require exactly 2 arguments', () => {
    expect(() => div([1])).toThrow(FunctionArgumentError);
    expect(() => div([1])).toThrow('requires exactly 2 arguments');

    expect(() => div([1, 2, 3])).toThrow(FunctionArgumentError);
    expect(() => div([1, 2, 3])).toThrow('requires exactly 2 arguments');
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => div(['abc', 5])).toThrow(FormulaParseError);
    expect(() => div(['abc', 5])).toThrow('Cannot convert');
  });
});
