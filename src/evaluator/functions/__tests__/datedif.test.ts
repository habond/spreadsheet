import { describe, it, expect } from 'vitest';
import { datedif } from '../datedif';
import { FunctionArgumentError } from '../../../errors/FunctionArgumentError';
import { FormulaParseError } from '../../../errors/FormulaParseError';

describe('DATEDIF function', () => {
  describe('Days (D)', () => {
    it('should calculate difference in days', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 0, 10).getTime();
      const result = datedif([start, end, 'D']);
      expect(result).toBe(9);
    });

    it('should handle same day', () => {
      const date = new Date(2024, 0, 1).getTime();
      const result = datedif([date, date, 'D']);
      expect(result).toBe(0);
    });

    it('should handle one day difference', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 0, 2).getTime();
      const result = datedif([start, end, 'D']);
      expect(result).toBe(1);
    });

    it('should handle lowercase unit', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 0, 10).getTime();
      const result = datedif([start, end, 'd']);
      expect(result).toBe(9);
    });
  });

  describe('Months (M)', () => {
    it('should calculate difference in months', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 3, 1).getTime();
      const result = datedif([start, end, 'M']);
      expect(result).toBe(3);
    });

    it('should handle same month', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 0, 15).getTime();
      const result = datedif([start, end, 'M']);
      expect(result).toBe(0);
    });

    it('should handle one month difference', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 1, 1).getTime();
      const result = datedif([start, end, 'M']);
      expect(result).toBe(1);
    });

    it('should handle partial months', () => {
      const start = new Date(2024, 0, 15).getTime();
      const end = new Date(2024, 2, 10).getTime();
      const result = datedif([start, end, 'M']);
      expect(result).toBe(2); // Counts month difference: Mar (2) - Jan (0) = 2
    });

    it('should handle lowercase unit', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 3, 1).getTime();
      const result = datedif([start, end, 'm']);
      expect(result).toBe(3);
    });
  });

  describe('Years (Y)', () => {
    it('should calculate difference in years', () => {
      const start = new Date(2020, 0, 1).getTime();
      const end = new Date(2024, 0, 1).getTime();
      const result = datedif([start, end, 'Y']);
      expect(result).toBe(4);
    });

    it('should handle same year', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 11, 31).getTime();
      const result = datedif([start, end, 'Y']);
      expect(result).toBe(0);
    });

    it('should handle one year difference', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2025, 0, 1).getTime();
      const result = datedif([start, end, 'Y']);
      expect(result).toBe(1);
    });

    it('should handle partial years', () => {
      const start = new Date(2024, 6, 1).getTime(); // July 2024
      const end = new Date(2026, 3, 1).getTime(); // April 2026
      const result = datedif([start, end, 'Y']);
      expect(result).toBe(2); // Counts year difference: 2026 - 2024 = 2
    });

    it('should handle lowercase unit', () => {
      const start = new Date(2020, 0, 1).getTime();
      const end = new Date(2024, 0, 1).getTime();
      const result = datedif([start, end, 'y']);
      expect(result).toBe(4);
    });
  });

  describe('String arguments', () => {
    it('should handle string timestamps', () => {
      const start = String(new Date(2024, 0, 1).getTime());
      const end = String(new Date(2024, 0, 10).getTime());
      const result = datedif([start, end, 'D']);
      expect(result).toBe(9);
    });
  });

  describe('Error handling', () => {
    it('should require exactly 3 arguments', () => {
      const date1 = new Date(2024, 0, 1).getTime();
      const date2 = new Date(2024, 0, 10).getTime();

      expect(() => datedif([date1, date2])).toThrow(FunctionArgumentError);
      expect(() => datedif([date1, date2])).toThrow('requires exactly 3 arguments');

      expect(() => datedif([date1, date2, 'D', 'extra'])).toThrow(FunctionArgumentError);
    });

    it('should throw error for invalid unit', () => {
      const start = new Date(2024, 0, 1).getTime();
      const end = new Date(2024, 0, 10).getTime();

      expect(() => datedif([start, end, 'X'])).toThrow(FunctionArgumentError);
      expect(() => datedif([start, end, 'X'])).toThrow('Invalid unit');
    });

    it('should throw error for non-numeric dates', () => {
      expect(() => datedif(['abc', 123, 'D'])).toThrow(FormulaParseError);
      expect(() => datedif(['abc', 123, 'D'])).toThrow('Cannot convert');
    });
  });

  describe('Edge cases', () => {
    it('should handle leap year in days', () => {
      const start = new Date(2024, 1, 28).getTime(); // Feb 28, 2024
      const end = new Date(2024, 2, 1).getTime(); // Mar 1, 2024
      const result = datedif([start, end, 'D']);
      expect(result).toBe(2); // 2024 is a leap year
    });

    it('should handle year boundary in months', () => {
      const start = new Date(2023, 11, 15).getTime(); // Dec 15, 2023
      const end = new Date(2024, 2, 15).getTime(); // Mar 15, 2024
      const result = datedif([start, end, 'M']);
      expect(result).toBe(3);
    });

    it('should handle large date differences', () => {
      const start = new Date(2000, 0, 1).getTime();
      const end = new Date(2024, 0, 1).getTime();
      const result = datedif([start, end, 'Y']);
      expect(result).toBe(24);
    });
  });
});
