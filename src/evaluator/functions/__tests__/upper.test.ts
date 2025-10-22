import { describe, it, expect } from 'vitest';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { upper } from '../upper';

describe('UPPER function', () => {
  it('should convert lowercase to uppercase', () => {
    const result = upper(['hello']);
    expect(result).toBe('HELLO');
  });

  it('should keep uppercase unchanged', () => {
    const result = upper(['HELLO']);
    expect(result).toBe('HELLO');
  });

  it('should convert mixed case to uppercase', () => {
    const result = upper(['HeLLo WoRLd']);
    expect(result).toBe('HELLO WORLD');
  });

  it('should handle empty string', () => {
    const result = upper(['']);
    expect(result).toBe('');
  });

  it('should handle numeric input', () => {
    const result = upper([123]);
    expect(result).toBe('123');
  });

  it('should preserve spaces', () => {
    const result = upper(['hello world']);
    expect(result).toBe('HELLO WORLD');
  });

  it('should handle special characters', () => {
    const result = upper(['hello@world!']);
    expect(result).toBe('HELLO@WORLD!');
  });

  it('should handle numbers in string', () => {
    const result = upper(['hello123']);
    expect(result).toBe('HELLO123');
  });

  it('should require exactly 1 argument', () => {
    expect(() => upper([])).toThrow(FunctionArgumentError);
    expect(() => upper([])).toThrow('requires exactly 1 argument');

    expect(() => upper(['text', 'extra'])).toThrow(FunctionArgumentError);
  });

  it('should handle single character', () => {
    const result = upper(['a']);
    expect(result).toBe('A');
  });

  it('should handle unicode characters', () => {
    const result = upper(['café']);
    expect(result).toBe('CAFÉ');
  });
});
