import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { lower } from '../lower';

describe('LOWER function', () => {
  it('should convert uppercase to lowercase', () => {
    const result = lower(['HELLO']);
    expect(result).toBe('hello');
  });

  it('should keep lowercase unchanged', () => {
    const result = lower(['hello']);
    expect(result).toBe('hello');
  });

  it('should convert mixed case to lowercase', () => {
    const result = lower(['HeLLo WoRLd']);
    expect(result).toBe('hello world');
  });

  it('should handle empty string', () => {
    const result = lower(['']);
    expect(result).toBe('');
  });

  it('should handle numeric input', () => {
    const result = lower([123]);
    expect(result).toBe('123');
  });

  it('should preserve spaces', () => {
    const result = lower(['HELLO WORLD']);
    expect(result).toBe('hello world');
  });

  it('should handle special characters', () => {
    const result = lower(['HELLO@WORLD!']);
    expect(result).toBe('hello@world!');
  });

  it('should handle numbers in string', () => {
    const result = lower(['HELLO123']);
    expect(result).toBe('hello123');
  });

  it('should require exactly 1 argument', () => {
    expect(() => lower([])).toThrow(FunctionArgumentError);
    expect(() => lower([])).toThrow('requires exactly 1 argument');

    expect(() => lower(['text', 'extra'])).toThrow(FunctionArgumentError);
  });

  it('should handle single character', () => {
    const result = lower(['A']);
    expect(result).toBe('a');
  });

  it('should handle unicode characters', () => {
    const result = lower(['CAFÉ']);
    expect(result).toBe('café');
  });
});
