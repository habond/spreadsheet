import { describe, it, expect, beforeEach } from 'vitest';
import { EvalEngine } from '../eval-engine';
import { CellID, EvalResult } from '../../types/core';

describe('EvalEngine', () => {
  let engine: EvalEngine;
  let cellValues: Map<string, string>;
  let cellResults: Map<string, EvalResult>;

  beforeEach(() => {
    cellValues = new Map();
    cellResults = new Map();

    const getCellValue = (cellId: CellID): string => {
      return cellValues.get(cellId) || '';
    };

    const getCellResult = (cellId: CellID): EvalResult | undefined => {
      return cellResults.get(cellId);
    };

    const setCellResult = (cellId: CellID, result: EvalResult): void => {
      cellResults.set(cellId, result);
    };

    engine = new EvalEngine(getCellValue, getCellResult, setCellResult);
  });

  describe('literal values', () => {
    it('should evaluate empty cell', () => {
      cellValues.set('A1', '');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: '', error: null });
    });

    it('should evaluate numeric value', () => {
      cellValues.set('A1', '42');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 42, error: null });
    });

    it('should evaluate decimal number', () => {
      cellValues.set('A1', '3.14');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 3.14, error: null });
    });

    it('should evaluate negative number', () => {
      cellValues.set('A1', '-5');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: -5, error: null });
    });

    it('should evaluate text value', () => {
      cellValues.set('A1', 'Hello');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 'Hello', error: null });
    });

    it('should evaluate text with spaces', () => {
      cellValues.set('A1', 'Hello World');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 'Hello World', error: null });
    });

    it('should evaluate number-like text as text', () => {
      cellValues.set('A1', '42 units');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: '42 units', error: null });
    });
  });

  describe('simple formulas', () => {
    it('should evaluate simple arithmetic formula', () => {
      cellValues.set('A1', '=5 + 3');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 8, error: null });
    });

    it('should evaluate formula with multiplication', () => {
      cellValues.set('A1', '=4 * 5');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 20, error: null });
    });

    it('should evaluate formula with operator precedence', () => {
      cellValues.set('A1', '=2 + 3 * 4');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 14, error: null });
    });

    it('should evaluate formula with parentheses', () => {
      cellValues.set('A1', '=(2 + 3) * 4');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 20, error: null });
    });
  });

  describe('cell references', () => {
    it('should evaluate cell reference', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 10, error: null });
    });

    it('should evaluate arithmetic with cell references', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '20');
      cellValues.set('C1', '=A1 + B1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');

      expect(cellResults.get('C1')).toEqual({ value: 30, error: null });
    });

    it('should evaluate complex formula with multiple cell references', () => {
      cellValues.set('A1', '5');
      cellValues.set('B1', '10');
      cellValues.set('C1', '2');
      cellValues.set('D1', '=A1 + B1 * C1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');
      engine.onCellChanged('D1');

      expect(cellResults.get('D1')).toEqual({ value: 25, error: null });
    });
  });

  describe('functions', () => {
    it('should evaluate SUM function', () => {
      cellValues.set('A1', '=SUM(1, 2, 3, 4)');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 10, error: null });
    });

    it('should evaluate SUM with cell references', () => {
      cellValues.set('A1', '10');
      cellValues.set('A2', '20');
      cellValues.set('A3', '30');
      cellValues.set('B1', '=SUM(A1, A2, A3)');

      engine.onCellChanged('A1');
      engine.onCellChanged('A2');
      engine.onCellChanged('A3');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 60, error: null });
    });

    it('should evaluate AVERAGE function', () => {
      cellValues.set('A1', '=AVERAGE(10, 20, 30)');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 20, error: null });
    });

    it('should evaluate MIN function', () => {
      cellValues.set('A1', '=MIN(5, 2, 8, 1)');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 1, error: null });
    });

    it('should evaluate MAX function', () => {
      cellValues.set('A1', '=MAX(5, 2, 8, 1)');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 8, error: null });
    });

    it('should evaluate nested functions', () => {
      cellValues.set('A1', '=SUM(1, AVG(2, 4), 3)');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 7, error: null });
    });
  });

  describe('dependency tracking', () => {
    it('should update dependent cells when source changes', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 * 2');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 20, error: null });

      // Change A1
      cellValues.set('A1', '5');
      engine.onCellChanged('A1');

      // B1 should be automatically updated
      expect(cellResults.get('A1')).toEqual({ value: 5, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 10, error: null });
    });

    it('should update chain of dependent cells', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 * 2');
      cellValues.set('C1', '=B1 + 5');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');

      expect(cellResults.get('A1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 20, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 25, error: null });

      // Change A1
      cellValues.set('A1', '5');
      engine.onCellChanged('A1');

      // Both B1 and C1 should be updated
      expect(cellResults.get('A1')).toEqual({ value: 5, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 15, error: null });
    });

    it('should update multiple dependent cells', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 + 5');
      cellValues.set('C1', '=A1 * 2');
      cellValues.set('D1', '=A1 - 3');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');
      engine.onCellChanged('D1');

      expect(cellResults.get('B1')).toEqual({ value: 15, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 20, error: null });
      expect(cellResults.get('D1')).toEqual({ value: 7, error: null });

      // Change A1
      cellValues.set('A1', '20');
      engine.onCellChanged('A1');

      // All dependent cells should update
      expect(cellResults.get('B1')).toEqual({ value: 25, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 40, error: null });
      expect(cellResults.get('D1')).toEqual({ value: 17, error: null });
    });

    it('should handle diamond dependency pattern', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 + 5');
      cellValues.set('C1', '=A1 * 2');
      cellValues.set('D1', '=B1 + C1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');
      engine.onCellChanged('D1');

      expect(cellResults.get('A1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 15, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 20, error: null });
      expect(cellResults.get('D1')).toEqual({ value: 35, error: null });

      // Change A1
      cellValues.set('A1', '5');
      engine.onCellChanged('A1');

      // All cells should update correctly
      expect(cellResults.get('A1')).toEqual({ value: 5, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('D1')).toEqual({ value: 20, error: null });
    });

    it('should update dependencies when formula changes', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '20');
      cellValues.set('C1', '=A1 + 5');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');

      expect(cellResults.get('C1')).toEqual({ value: 15, error: null });

      // Change C1 to reference B1 instead
      cellValues.set('C1', '=B1 + 5');
      engine.onCellChanged('C1');

      expect(cellResults.get('C1')).toEqual({ value: 25, error: null });

      // Changing A1 should not affect C1 anymore
      cellValues.set('A1', '100');
      engine.onCellChanged('A1');

      expect(cellResults.get('C1')).toEqual({ value: 25, error: null });

      // But changing B1 should affect C1
      cellValues.set('B1', '30');
      engine.onCellChanged('B1');

      expect(cellResults.get('C1')).toEqual({ value: 35, error: null });
    });
  });

  describe('circular dependencies', () => {
    it('should detect direct self-reference', () => {
      cellValues.set('A1', '=A1 + 1');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toContain('Circular dependency');
      expect(result?.error).toContain('A1');
      expect(result?.value).toBeNull();
    });

    it('should detect two-cell circular dependency', () => {
      cellValues.set('A1', '=B1 + 1');
      cellValues.set('B1', '=A1 + 1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      const result = cellResults.get('B1');
      expect(result?.error).toContain('Circular dependency');
      expect(result?.error).toContain('A1');
      expect(result?.error).toContain('B1');
      expect(result?.value).toBeNull();
    });

    it('should detect three-cell circular dependency', () => {
      cellValues.set('A1', '=B1 + 1');
      cellValues.set('B1', '=C1 + 1');
      cellValues.set('C1', '=A1 + 1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');

      const result = cellResults.get('C1');
      expect(result?.error).toContain('Circular dependency');
      expect(result?.value).toBeNull();
    });

    it('should detect circular dependency in complex graph', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 + 1');
      cellValues.set('C1', '=B1 + 1');
      cellValues.set('D1', '=C1 + 1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');
      engine.onCellChanged('D1');

      // All should work fine
      expect(cellResults.get('D1')).toEqual({ value: 13, error: null });

      // Now create a cycle
      cellValues.set('A1', '=D1 + 1');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toContain('Circular dependency');
      expect(result?.value).toBeNull();
    });

    it('should recover from circular dependency when fixed', () => {
      cellValues.set('A1', '=B1 + 1');
      cellValues.set('B1', '=A1 + 1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')?.error).toContain('Circular dependency');

      // Fix by making B1 a literal
      cellValues.set('B1', '10');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('A1')).toEqual({ value: 11, error: null });
    });
  });

  describe('error handling', () => {
    it('should handle division by zero', () => {
      cellValues.set('A1', '=10 / 0');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toContain('Division by zero');
      expect(result?.value).toBeNull();
    });

    it('should handle invalid formula syntax', () => {
      cellValues.set('A1', '=5 +');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toBeTruthy();
      expect(result?.value).toBeNull();
    });

    it('should handle unknown function', () => {
      cellValues.set('A1', '=UNKNOWN(1, 2)');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toContain('Unknown function');
      expect(result?.value).toBeNull();
    });

    it('should handle reference to empty cell', () => {
      cellValues.set('A1', '=B1 + 5');
      engine.onCellChanged('A1');

      const result = cellResults.get('A1');
      expect(result?.error).toContain('has no value');
      expect(result?.value).toBeNull();
    });

    it('should handle reference to cell with error', () => {
      cellValues.set('A1', '=10 / 0');
      cellValues.set('B1', '=A1 + 5');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('A1')?.error).toContain('Division by zero');

      const result = cellResults.get('B1');
      expect(result?.error).toContain('has error');
      expect(result?.value).toBeNull();
    });

    it('should propagate errors through dependency chain', () => {
      cellValues.set('A1', '=10 / 0');
      cellValues.set('B1', '=A1 + 1');
      cellValues.set('C1', '=B1 + 1');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');
      engine.onCellChanged('C1');

      expect(cellResults.get('A1')?.error).toContain('Division by zero');
      expect(cellResults.get('B1')?.error).toContain('has error');
      expect(cellResults.get('C1')?.error).toContain('has error');
    });

    it('should recover from errors when source is fixed', () => {
      cellValues.set('A1', '=10 / 0');
      cellValues.set('B1', '=A1 + 5');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')?.error).toBeTruthy();

      // Fix A1
      cellValues.set('A1', '10');
      engine.onCellChanged('A1');

      expect(cellResults.get('A1')).toEqual({ value: 10, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 15, error: null });
    });
  });

  describe('complex scenarios', () => {
    it('should handle spreadsheet with many interconnected cells', () => {
      cellValues.set('A1', '10');
      cellValues.set('A2', '20');
      cellValues.set('A3', '30');
      cellValues.set('B1', '=SUM(A1, A2, A3)');
      cellValues.set('B2', '=AVERAGE(A1, A2, A3)');
      cellValues.set('B3', '=MAX(A1, A2, A3)');
      cellValues.set('C1', '=B1 + B2');
      cellValues.set('C2', '=B2 * 2');
      cellValues.set('C3', '=B3 - B1');

      ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].forEach(cell => {
        engine.onCellChanged(cell);
      });

      expect(cellResults.get('B1')).toEqual({ value: 60, error: null });
      expect(cellResults.get('B2')).toEqual({ value: 20, error: null });
      expect(cellResults.get('B3')).toEqual({ value: 30, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 80, error: null });
      expect(cellResults.get('C2')).toEqual({ value: 40, error: null });
      expect(cellResults.get('C3')).toEqual({ value: -30, error: null });

      // Change A1
      cellValues.set('A1', '100');
      engine.onCellChanged('A1');

      // All dependent cells should update
      expect(cellResults.get('A1')).toEqual({ value: 100, error: null });
      expect(cellResults.get('B1')).toEqual({ value: 150, error: null });
      expect(cellResults.get('B2')).toEqual({ value: 50, error: null });
      expect(cellResults.get('B3')).toEqual({ value: 100, error: null });
      expect(cellResults.get('C1')).toEqual({ value: 200, error: null });
      expect(cellResults.get('C2')).toEqual({ value: 100, error: null });
      expect(cellResults.get('C3')).toEqual({ value: -50, error: null });
    });

    it('should handle conversion from formula to literal', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '=A1 * 2');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 20, error: null });

      // Convert B1 to literal
      cellValues.set('B1', '100');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 100, error: null });

      // Changing A1 should not affect B1 anymore
      cellValues.set('A1', '50');
      engine.onCellChanged('A1');

      expect(cellResults.get('B1')).toEqual({ value: 100, error: null });
    });

    it('should handle conversion from literal to formula', () => {
      cellValues.set('A1', '10');
      cellValues.set('B1', '100');

      engine.onCellChanged('A1');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 100, error: null });

      // Convert B1 to formula
      cellValues.set('B1', '=A1 * 2');
      engine.onCellChanged('B1');

      expect(cellResults.get('B1')).toEqual({ value: 20, error: null });

      // Now B1 should respond to A1 changes
      cellValues.set('A1', '50');
      engine.onCellChanged('A1');

      expect(cellResults.get('B1')).toEqual({ value: 100, error: null });
    });
  });
});
