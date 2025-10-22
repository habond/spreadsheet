import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { today } from '../today';

describe('TODAY function', () => {
  it('should return a timestamp', () => {
    const result = today([]);
    expect(typeof result).toBe('number');
  });

  it('should return timestamp for midnight', () => {
    const result = today([]);
    const date = new Date(result);

    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
  });

  it('should return current date', () => {
    const result = today([]);
    const date = new Date(result);
    const now = new Date();

    expect(date.getFullYear()).toBe(now.getFullYear());
    expect(date.getMonth()).toBe(now.getMonth());
    expect(date.getDate()).toBe(now.getDate());
  });

  it('should require no arguments', () => {
    expect(() => today([1])).toThrow(FunctionArgumentError);
    expect(() => today([1])).toThrow('requires no arguments');
  });

  it('should return a valid date timestamp', () => {
    const result = today([]);
    const date = new Date(result);

    expect(date.getTime()).toBe(result);
    expect(isNaN(date.getTime())).toBe(false);
  });

  it('should be less than or equal to NOW', () => {
    const todayResult = today([]);
    const nowResult = Date.now();

    expect(todayResult).toBeLessThanOrEqual(nowResult);
  });
});
