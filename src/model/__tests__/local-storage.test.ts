import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CellFormat } from '../../types/core';
import {
  clearSpreadsheetState,
  loadSpreadsheetState,
  saveSpreadsheetState,
  type SpreadsheetState,
} from '../local-storage';

describe('local-storage', () => {
  let store: Record<string, string> = {};

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };

  beforeEach(() => {
    // Reset mock store before each test
    store = {};
    vi.clearAllMocks();

    // Replace global localStorage with mock
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  describe('saveSpreadsheetState', () => {
    it('should save state to localStorage', () => {
      const state: SpreadsheetState = {
        cells: { A1: { content: '42' }, B2: { content: '=A1 + 10' } },
        columnWidths: [
          [0, 120],
          [1, 150],
        ],
        rowHeights: [[0, 40]],
        cellFormats: [['A1', CellFormat.Number]],
        selectedCell: 'A1',
      };

      saveSpreadsheetState(state);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'spreadsheet-state',
        JSON.stringify(state)
      );
    });

    it('should save empty state', () => {
      const state: SpreadsheetState = {
        cells: {},
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: null,
      };

      saveSpreadsheetState(state);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'spreadsheet-state',
        JSON.stringify(state)
      );
    });

    it('should save state with multiple cells', () => {
      const state: SpreadsheetState = {
        cells: {
          A1: { content: '10' },
          A2: { content: '20' },
          A3: { content: '=SUM(A1:A2)' },
          B1: { content: 'Hello' },
          B2: { content: '=UPPER(B1)' },
        },
        columnWidths: [
          [0, 100],
          [1, 100],
        ],
        rowHeights: [
          [0, 32],
          [1, 32],
          [2, 32],
        ],
        cellFormats: [
          ['A1', CellFormat.Number],
          ['A2', CellFormat.Number],
          ['A3', CellFormat.Number],
        ],
        selectedCell: 'A3',
      };

      saveSpreadsheetState(state);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed.cells).toEqual(state.cells);
      expect(parsed.selectedCell).toBe('A3');
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const state: SpreadsheetState = {
        cells: { A1: { content: '42' } },
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: 'A1',
      };

      // Should not throw - errors are silently handled
      expect(() => saveSpreadsheetState(state)).not.toThrow();
    });
  });

  describe('loadSpreadsheetState', () => {
    it('should load state from localStorage', () => {
      const state: SpreadsheetState = {
        cells: { A1: { content: '42' }, B2: { content: '=A1 + 10' } },
        columnWidths: [
          [0, 120],
          [1, 150],
        ],
        rowHeights: [[0, 40]],
        cellFormats: [['A1', CellFormat.Number]],
        selectedCell: 'A1',
      };

      localStorageMock.setItem('spreadsheet-state', JSON.stringify(state));

      const loaded = loadSpreadsheetState();

      expect(loaded).toEqual(state);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('spreadsheet-state');
    });

    it('should return null when no state exists', () => {
      const loaded = loadSpreadsheetState();

      expect(loaded).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('spreadsheet-state');
    });

    it('should return null when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const loaded = loadSpreadsheetState();

      expect(loaded).toBeNull();
    });

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.setItem('spreadsheet-state', 'invalid json {{{');

      const loaded = loadSpreadsheetState();

      // Should return null when JSON is invalid
      expect(loaded).toBeNull();
    });

    it('should handle load errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      const loaded = loadSpreadsheetState();

      // Should return null when localStorage throws an error
      expect(loaded).toBeNull();
    });
  });

  describe('clearSpreadsheetState', () => {
    it('should remove state from localStorage', () => {
      const state: SpreadsheetState = {
        cells: { A1: { content: '42' } },
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: 'A1',
      };

      localStorageMock.setItem('spreadsheet-state', JSON.stringify(state));

      clearSpreadsheetState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('spreadsheet-state');
      expect(localStorageMock.getItem('spreadsheet-state')).toBeNull();
    });

    it('should not throw when clearing non-existent state', () => {
      expect(() => clearSpreadsheetState()).not.toThrow();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('spreadsheet-state');
    });

    it('should handle clear errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      // Should not throw - errors are silently handled
      expect(() => clearSpreadsheetState()).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should round-trip save and load', () => {
      const originalState: SpreadsheetState = {
        cells: {
          A1: { content: '10' },
          A2: { content: '20' },
          A3: { content: '=SUM(A1:A2)' },
          B1: { content: 'Hello' },
        },
        columnWidths: [
          [0, 120],
          [1, 150],
        ],
        rowHeights: [
          [0, 40],
          [1, 45],
        ],
        cellFormats: [
          ['A1', CellFormat.Number],
          ['A2', CellFormat.Currency],
          ['A3', CellFormat.Percentage],
        ],
        selectedCell: 'B1',
      };

      saveSpreadsheetState(originalState);
      const loadedState = loadSpreadsheetState();

      expect(loadedState).toEqual(originalState);
    });

    it('should clear and verify state is gone', () => {
      const state: SpreadsheetState = {
        cells: { A1: { content: '42' } },
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: 'A1',
      };

      saveSpreadsheetState(state);
      expect(loadSpreadsheetState()).toEqual(state);

      clearSpreadsheetState();
      expect(loadSpreadsheetState()).toBeNull();
    });

    it('should overwrite existing state on save', () => {
      const state1: SpreadsheetState = {
        cells: { A1: { content: '10' } },
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: 'A1',
      };

      const state2: SpreadsheetState = {
        cells: { B2: { content: '20' } },
        columnWidths: [[1, 150]],
        rowHeights: [[1, 50]],
        cellFormats: [],
        selectedCell: 'B2',
      };

      saveSpreadsheetState(state1);
      saveSpreadsheetState(state2);

      const loaded = loadSpreadsheetState();
      expect(loaded).toEqual(state2);
      expect(loaded).not.toEqual(state1);
    });

    it('should handle state with cellFormats', () => {
      const stateWithFormats: SpreadsheetState = {
        cells: { A1: { content: '42' } },
        columnWidths: [],
        rowHeights: [],
        cellFormats: [],
        selectedCell: 'A1',
      };

      saveSpreadsheetState(stateWithFormats);
      const loaded = loadSpreadsheetState();

      expect(loaded).toEqual(stateWithFormats);
      expect(loaded?.cellFormats).toEqual([]);
    });

    it('should handle large state with many cells', () => {
      const largeCells: Record<string, { content: string }> = {};
      const largeFormats: Array<[string, CellFormat]> = [];

      // Create 100 cells
      for (let i = 0; i < 100; i++) {
        const cellId = `A${i + 1}`;
        largeCells[cellId] = { content: `${i}` };
        largeFormats.push([cellId, CellFormat.Number]);
      }

      const largeState: SpreadsheetState = {
        cells: largeCells,
        columnWidths: [[0, 100]],
        rowHeights: Array.from({ length: 100 }, (_, i) => [i, 32]),
        cellFormats: largeFormats,
        selectedCell: 'A50',
      };

      saveSpreadsheetState(largeState);
      const loaded = loadSpreadsheetState();

      expect(loaded).toEqual(largeState);
      expect(loaded?.cells).toHaveProperty('A50');
      expect(Object.keys(loaded?.cells || {}).length).toBe(100);
    });
  });
});
