import { describe, it, expect } from 'vitest';
import { columnToNumber, numberToColumn } from '../column-utils';

describe('column-utils', () => {
  describe('columnToNumber', () => {
    it('should convert single letter columns', () => {
      expect(columnToNumber('A')).toBe(1);
      expect(columnToNumber('B')).toBe(2);
      expect(columnToNumber('C')).toBe(3);
      expect(columnToNumber('Z')).toBe(26);
    });

    it('should convert double letter columns', () => {
      expect(columnToNumber('AA')).toBe(27);
      expect(columnToNumber('AB')).toBe(28);
      expect(columnToNumber('AZ')).toBe(52);
      expect(columnToNumber('BA')).toBe(53);
      expect(columnToNumber('ZZ')).toBe(702);
    });

    it('should convert triple letter columns', () => {
      expect(columnToNumber('AAA')).toBe(703);
      expect(columnToNumber('AAB')).toBe(704);
      expect(columnToNumber('ABC')).toBe(731);
    });

    it('should handle edge cases', () => {
      expect(columnToNumber('A')).toBe(1);
      expect(columnToNumber('Z')).toBe(26);
      expect(columnToNumber('AA')).toBe(27);
      expect(columnToNumber('AZ')).toBe(52);
      expect(columnToNumber('BA')).toBe(53);
      expect(columnToNumber('BZ')).toBe(78);
    });
  });

  describe('numberToColumn', () => {
    it('should convert single digit numbers', () => {
      expect(numberToColumn(1)).toBe('A');
      expect(numberToColumn(2)).toBe('B');
      expect(numberToColumn(3)).toBe('C');
      expect(numberToColumn(26)).toBe('Z');
    });

    it('should convert double digit numbers', () => {
      expect(numberToColumn(27)).toBe('AA');
      expect(numberToColumn(28)).toBe('AB');
      expect(numberToColumn(52)).toBe('AZ');
      expect(numberToColumn(53)).toBe('BA');
      expect(numberToColumn(702)).toBe('ZZ');
    });

    it('should convert triple digit numbers', () => {
      expect(numberToColumn(703)).toBe('AAA');
      expect(numberToColumn(704)).toBe('AAB');
      expect(numberToColumn(731)).toBe('ABC');
    });

    it('should be inverse of columnToNumber', () => {
      // Test round-trip conversions
      for (let i = 1; i <= 100; i++) {
        const col = numberToColumn(i);
        expect(columnToNumber(col)).toBe(i);
      }

      // Test specific edge cases
      const testCases = ['A', 'Z', 'AA', 'AZ', 'BA', 'ZZ', 'AAA', 'ABC', 'XYZ'];
      testCases.forEach(col => {
        const num = columnToNumber(col);
        expect(numberToColumn(num)).toBe(col);
      });
    });
  });
});
