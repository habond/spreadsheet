import { describe, it, expect } from 'vitest';
import { trim } from '../trim';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

describe('TRIM function', () => {
  it('should remove leading and trailing spaces', () => {
    const result = trim(['  text  ']);
    expect(result).toBe('text');
  });

  it('should remove leading spaces only', () => {
    const result = trim(['  text']);
    expect(result).toBe('text');
  });

  it('should remove trailing spaces only', () => {
    const result = trim(['text  ']);
    expect(result).toBe('text');
  });

  it('should handle text with no spaces', () => {
    const result = trim(['text']);
    expect(result).toBe('text');
  });

  it('should preserve internal spaces', () => {
    const result = trim(['  hello world  ']);
    expect(result).toBe('hello world');
  });

  it('should handle empty string', () => {
    const result = trim(['']);
    expect(result).toBe('');
  });

  it('should handle string with only spaces', () => {
    const result = trim(['     ']);
    expect(result).toBe('');
  });

  it('should handle numeric input', () => {
    const result = trim([123]);
    expect(result).toBe('123');
  });

  it('should handle tabs and spaces', () => {
    const result = trim(['\t  text  \t']);
    expect(result).toBe('text');
  });

  it('should handle newlines', () => {
    const result = trim(['\n  text  \n']);
    expect(result).toBe('text');
  });

  it('should handle multiple whitespace types', () => {
    const result = trim([' \t\n text \n\t ']);
    expect(result).toBe('text');
  });

  it('should handle single space', () => {
    const result = trim([' ']);
    expect(result).toBe('');
  });

  it('should require exactly 1 argument', () => {
    expect(() => trim([])).toThrow(FunctionArgumentError);
    expect(() => trim([])).toThrow('requires exactly 1 argument');

    expect(() => trim(['text', 'extra'])).toThrow(FunctionArgumentError);
  });

  it('should preserve multiple internal spaces', () => {
    const result = trim(['  hello    world  ']);
    expect(result).toBe('hello    world');
  });
});
