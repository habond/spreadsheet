import { describe, it, expect } from 'vitest';
import { translateCellRef, translateFormulaReferences } from '../cell-reference-translator';

describe('translateCellRef', () => {
  it('should translate cell reference with positive offsets', () => {
    expect(translateCellRef('A1', 1, 1)).toBe('B2');
    expect(translateCellRef('B2', 2, 3)).toBe('E4');
  });

  it('should translate cell reference with negative offsets', () => {
    expect(translateCellRef('C3', -1, -1)).toBe('B2');
    expect(translateCellRef('E5', -2, -3)).toBe('B3');
  });

  it('should translate cell reference with zero offset', () => {
    expect(translateCellRef('A1', 0, 0)).toBe('A1');
  });

  it('should handle multi-letter columns', () => {
    expect(translateCellRef('AA10', 1, 1)).toBe('AB11');
    expect(translateCellRef('AZ5', 0, 1)).toBe('BA5');
  });

  it('should not translate below row 1', () => {
    expect(translateCellRef('A2', -2, 0)).toBe('A2'); // Would be A0, invalid
  });

  it('should not translate before column A', () => {
    expect(translateCellRef('B1', 0, -2)).toBe('B1'); // Would be column -1, invalid
  });

  it('should return original for invalid cell reference', () => {
    expect(translateCellRef('invalid', 1, 1)).toBe('invalid');
    expect(translateCellRef('123', 1, 1)).toBe('123');
  });
});

describe('translateFormulaReferences', () => {
  describe('simple cell references', () => {
    it('should translate single cell reference formula', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=B1', sourcePos, destPos)).toBe('=B2');
    });

    it('should translate formula with multiple cell references', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=B1+C1', sourcePos, destPos)).toBe('=B2+C2');
    });

    it('should translate formula with no offset', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 0, col: 0 }; // A1
      expect(translateFormulaReferences('=B1+C1', sourcePos, destPos)).toBe('=B1+C1');
    });

    it('should translate formula when moving down', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 2, col: 0 }; // A3
      expect(translateFormulaReferences('=A1+B1', sourcePos, destPos)).toBe('=A3+B3');
    });

    it('should translate formula when moving right', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 0, col: 2 }; // C1
      expect(translateFormulaReferences('=A1+A2', sourcePos, destPos)).toBe('=C1+C2');
    });

    it('should translate formula when moving diagonally', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 2, col: 3 }; // D3
      expect(translateFormulaReferences('=B2', sourcePos, destPos)).toBe('=E4');
    });
  });

  describe('range references', () => {
    it('should translate range reference', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=SUM(A1:A5)', sourcePos, destPos)).toBe('=SUM(A2:A6)');
    });

    it('should translate 2D range reference', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 0, col: 1 }; // B1
      expect(translateFormulaReferences('=SUM(A1:C3)', sourcePos, destPos)).toBe('=SUM(B1:D3)');
    });

    it('should translate multiple ranges in formula', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=SUM(A1:A5, B1:B5)', sourcePos, destPos)).toBe(
        '=SUM(A2:A6, B2:B6)'
      );
    });
  });

  describe('complex formulas', () => {
    it('should translate nested function calls', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=IF(A1>0, SUM(B1:B5), 0)', sourcePos, destPos)).toBe(
        '=IF(A2>0, SUM(B2:B6), 0)'
      );
    });

    it('should translate arithmetic operations', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 0, col: 1 }; // B1
      expect(translateFormulaReferences('=A1*B1+C1/D1', sourcePos, destPos)).toBe('=B1*C1+D1/E1');
    });

    it('should translate comparison operations', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('=A1>B1', sourcePos, destPos)).toBe('=A2>B2');
    });
  });

  describe('string literals', () => {
    it('should NOT translate cell references inside string literals', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      // "B2" is a string literal, should NOT be translated
      expect(translateFormulaReferences('=CONCATENATE("B2", A1)', sourcePos, destPos)).toBe(
        '=CONCATENATE("B2", A2)'
      );
    });

    it('should handle mix of string literals and cell references', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 0, col: 1 }; // B1
      expect(
        translateFormulaReferences('=CONCATENATE("Cell: ", A1, " Value: ", B1)', sourcePos, destPos)
      ).toBe('=CONCATENATE("Cell: ", B1, " Value: ", C1)');
    });
  });

  describe('non-formula content', () => {
    it('should return non-formula content unchanged', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      expect(translateFormulaReferences('42', sourcePos, destPos)).toBe('42');
      expect(translateFormulaReferences('hello', sourcePos, destPos)).toBe('hello');
      expect(translateFormulaReferences('', sourcePos, destPos)).toBe('');
    });
  });

  describe('error handling', () => {
    it('should return original formula if parsing fails', () => {
      const sourcePos = { row: 0, col: 0 }; // A1
      const destPos = { row: 1, col: 0 }; // A2
      // Invalid formula syntax
      expect(translateFormulaReferences('=SUM(', sourcePos, destPos)).toBe('=SUM(');
    });
  });

  describe('edge cases', () => {
    it('should handle multi-letter column references', () => {
      const sourcePos = { row: 0, col: 25 }; // Z1
      const destPos = { row: 0, col: 26 }; // AA1
      expect(translateFormulaReferences('=Z1+AA1', sourcePos, destPos)).toBe('=AA1+AB1');
    });

    it('should handle large row numbers', () => {
      const sourcePos = { row: 98, col: 0 }; // A99
      const destPos = { row: 99, col: 0 }; // A100
      expect(translateFormulaReferences('=A99+A100', sourcePos, destPos)).toBe('=A100+A101');
    });
  });
});
