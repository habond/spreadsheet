import { describe, it, expect } from 'vitest';
import { concatenate } from '../concatenate';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

describe('CONCATENATE function', () => {
  it('should concatenate string literals', () => {
    const result = concatenate(['Hello', ' ', 'World']);
    expect(result).toBe('Hello World');
  });

  it('should concatenate two strings', () => {
    const result = concatenate(['Hello', 'World']);
    expect(result).toBe('HelloWorld');
  });

  it('should concatenate single string', () => {
    const result = concatenate(['Hello']);
    expect(result).toBe('Hello');
  });

  it('should concatenate numbers as strings', () => {
    const result = concatenate([1, 2, 3]);
    expect(result).toBe('123');
  });

  it('should concatenate mixed numbers and strings', () => {
    const result = concatenate(['Total: ', 42]);
    expect(result).toBe('Total: 42');
  });

  it('should handle empty strings', () => {
    const result = concatenate(['', 'Hello', '']);
    expect(result).toBe('Hello');
  });

  it('should concatenate many strings', () => {
    const result = concatenate(['a', 'b', 'c', 'd', 'e']);
    expect(result).toBe('abcde');
  });

  it('should handle spaces', () => {
    const result = concatenate(['Hello', ' ', 'World', '!']);
    expect(result).toBe('Hello World!');
  });

  it('should convert zero to string', () => {
    const result = concatenate(['Value: ', 0]);
    expect(result).toBe('Value: 0');
  });

  it('should handle negative numbers', () => {
    const result = concatenate(['Temperature: ', -5, ' degrees']);
    expect(result).toBe('Temperature: -5 degrees');
  });

  it('should handle decimal numbers', () => {
    const result = concatenate(['Price: $', 19.99]);
    expect(result).toBe('Price: $19.99');
  });

  it('should require at least one argument', () => {
    expect(() => concatenate([])).toThrow(FunctionArgumentError);
    expect(() => concatenate([])).toThrow('requires at least one argument');
  });

  it('should handle special characters', () => {
    const result = concatenate(['Hello', '\n', 'World']);
    expect(result).toBe('Hello\nWorld');
  });
});
