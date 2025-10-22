import { describe, it, expect } from 'vitest';
import { countif } from '../countif';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';

describe('COUNTIF function', () => {
  describe('exact match criteria', () => {
    it('should count numeric exact matches', () => {
      const range = [10, 20, 30, 20, 40];
      const result = countif([range, '20']);
      expect(result).toBe(2);
    });

    it('should count text exact matches (case-insensitive)', () => {
      const range = ['apple', 'APPLE', 'banana', 'Apple'];
      const result = countif([range, 'apple']);
      expect(result).toBe(3);
    });

    it('should count zero matches', () => {
      const range = [10, 20, 30];
      const result = countif([range, '50']);
      expect(result).toBe(0);
    });

    it('should handle mixed types', () => {
      const range = [10, '10', 20, 30];
      const result = countif([range, '10']);
      expect(result).toBe(2);
    });
  });

  describe('comparison criteria', () => {
    it('should count values greater than criteria (>)', () => {
      const range = [10, 20, 30, 40, 50];
      const result = countif([range, '>30']);
      expect(result).toBe(2);
    });

    it('should count values less than criteria (<)', () => {
      const range = [10, 20, 30, 40, 50];
      const result = countif([range, '<30']);
      expect(result).toBe(2);
    });

    it('should count values greater than or equal to criteria (>=)', () => {
      const range = [10, 20, 30, 40, 50];
      const result = countif([range, '>=30']);
      expect(result).toBe(3);
    });

    it('should count values less than or equal to criteria (<=)', () => {
      const range = [10, 20, 30, 40, 50];
      const result = countif([range, '<=30']);
      expect(result).toBe(3);
    });

    it('should count values equal to criteria (=)', () => {
      const range = [10, 20, 30, 20, 40];
      const result = countif([range, '=20']);
      expect(result).toBe(2);
    });

    it('should count values not equal to criteria (<>)', () => {
      const range = [10, 20, 30, 20, 40];
      const result = countif([range, '<>20']);
      expect(result).toBe(3);
    });

    it('should skip non-numeric values in comparisons', () => {
      const range = [10, 'apple', 30, 'banana', 50];
      const result = countif([range, '>20']);
      expect(result).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should require exactly 2 arguments', () => {
      expect(() => countif([1, 2, 3])).toThrow(FunctionArgumentError);
      expect(() => countif([1, 2, 3])).toThrow('requires exactly 2 arguments');
    });

    it('should require first argument to be a range', () => {
      expect(() => countif([10, '>5'])).toThrow(FunctionArgumentError);
      expect(() => countif([10, '>5'])).toThrow('first argument must be a range');
    });

    it('should throw error for invalid comparison value', () => {
      const range = [10, 20, 30];
      expect(() => countif([range, '>abc'])).toThrow(FunctionArgumentError);
      expect(() => countif([range, '>abc'])).toThrow('invalid comparison value');
    });
  });

  describe('edge cases', () => {
    it('should handle empty range', () => {
      const result = countif([[], '10']);
      expect(result).toBe(0);
    });

    it('should handle range with all non-numeric values for comparison', () => {
      const range = ['apple', 'banana', 'cherry'];
      const result = countif([range, '>10']);
      expect(result).toBe(0);
    });

    it('should handle string numeric values in comparisons', () => {
      const range = ['10', '20', '30'];
      const result = countif([range, '>15']);
      expect(result).toBe(2);
    });
  });
});
