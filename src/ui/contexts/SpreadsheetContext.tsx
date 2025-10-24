import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { EvalEngine } from '../../engine/eval-engine';
import { CellResultStore } from '../../model/cell-result-store';
import {
  loadSpreadsheetState,
  saveSpreadsheetState,
  clearSpreadsheetState,
} from '../../model/local-storage';
import { Spreadsheet } from '../../model/spreadsheet';
import type { CellFormat, CellID, CellStyle } from '../../types/core';

interface SpreadsheetContextType {
  spreadsheet: Spreadsheet;
  evalEngine: EvalEngine;
  cellResultStore: CellResultStore;
  selectedCell: CellID | null;
  copiedCell: CellID | null;
  selectCell: (cellId: CellID) => void;
  updateCell: (cellId: CellID, content: string) => void;
  setColumnWidth: (colIndex: number, width: number) => void;
  setRowHeight: (rowIndex: number, height: number) => void;
  setCellFormat: (cellId: CellID, format: CellFormat) => void;
  updateCellStyle: (cellId: CellID, styleUpdates: Partial<CellStyle>) => void;
  clearSpreadsheet: () => void;
  copyCell: () => void;
  cutCell: () => void;
  pasteCell: () => void;
  clearClipboard: () => void;
  fillRange: (startCellId: CellID, endCellId: CellID) => void;
  insertColumnLeft: (colIndex: number) => void;
  insertColumnRight: (colIndex: number) => void;
  insertRowAbove: (rowIndex: number) => void;
  insertRowBelow: (rowIndex: number) => void;
  deleteColumn: (colIndex: number) => void;
  deleteRow: (rowIndex: number) => void;
  formulaInputRef: RefObject<HTMLInputElement | null> | null;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

interface SpreadsheetProviderProps {
  children: ReactNode;
  rows?: number;
  cols?: number;
  formulaInputRef: RefObject<HTMLInputElement | null> | null;
}

export function SpreadsheetProvider({
  children,
  rows = 20,
  cols = 10,
  formulaInputRef,
}: SpreadsheetProviderProps) {
  // Initialize core components (only once)
  // eslint-disable-next-line react/hook-use-state
  const [state] = useState(() => {
    const spreadsheet = new Spreadsheet(rows, cols);
    const cellResultStore = new CellResultStore(cellId => spreadsheet.getCellFormat(cellId));

    // Load saved state from localStorage
    const savedState = loadSpreadsheetState();
    if (savedState) {
      spreadsheet.importState(savedState);
    } else {
      // Auto-select cell A1 if no saved state
      spreadsheet.selectCell('A1');
    }

    const evalEngine = new EvalEngine(
      // getCellValue callback
      cellId => spreadsheet.getCellContent(cellId),
      // getCellResult callback
      cellId => cellResultStore.get(cellId),
      // setCellResult callback
      (cellId, result) => {
        // CellResultStore.set() now automatically notifies subscribers
        cellResultStore.set(cellId, result);
      }
    );

    // Re-evaluate all cells if we loaded state
    if (savedState) {
      Object.keys(savedState.cells).forEach(cellId => {
        evalEngine.onCellChanged(cellId);
      });
    }

    return {
      spreadsheet,
      evalEngine,
      cellResultStore,
    };
  });

  const [selectedCell, setSelectedCell] = useState<CellID | null>(() => {
    const savedState = loadSpreadsheetState();
    return savedState?.selectedCell || 'A1';
  });

  const [copiedCell, setCopiedCell] = useState<CellID | null>(null);

  // Create a debounced save function
  const debouncedSave = useMemo(() => {
    let timeoutId: number;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const stateToSave = state.spreadsheet.exportState();
        saveSpreadsheetState(stateToSave);
      }, 500);
    };
  }, [state.spreadsheet]);

  const selectCell = useCallback(
    (cellId: CellID) => {
      state.spreadsheet.selectCell(cellId);
      setSelectedCell(cellId);
      debouncedSave(); // Save after cell selection changes
    },
    [state.spreadsheet, debouncedSave]
  );

  const updateCell = useCallback(
    (cellId: CellID, content: string) => {
      state.spreadsheet.setCellContent(cellId, content);
      state.evalEngine.onCellChanged(cellId);
      // No forceUpdate needed - subscribers are notified automatically
      debouncedSave(); // Save after cell content changes
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const setColumnWidth = useCallback(
    (colIndex: number, width: number) => {
      state.spreadsheet.setColumnWidth(colIndex, width);
      debouncedSave(); // Save after column width changes
    },
    [state.spreadsheet, debouncedSave]
  );

  const setRowHeight = useCallback(
    (rowIndex: number, height: number) => {
      state.spreadsheet.setRowHeight(rowIndex, height);
      debouncedSave(); // Save after row height changes
    },
    [state.spreadsheet, debouncedSave]
  );

  const setCellFormat = useCallback(
    (cellId: CellID, format: CellFormat) => {
      state.spreadsheet.setCellFormat(cellId, format);
      // Notify the specific cell's subscribers about the format change
      const result = state.cellResultStore.get(cellId);
      if (result) {
        state.cellResultStore.set(cellId, result);
      }
      debouncedSave(); // Save after format changes
    },
    [state.spreadsheet, state.cellResultStore, debouncedSave]
  );

  const updateCellStyle = useCallback(
    (cellId: CellID, styleUpdates: Partial<CellStyle>) => {
      state.spreadsheet.updateCellStyle(cellId, styleUpdates);
      // Notify the specific cell's subscribers about the style change
      // We need to notify even for cells without results (empty cells with only styles)
      const result = state.cellResultStore.get(cellId) || { value: null, error: null };
      state.cellResultStore.set(cellId, result);
      debouncedSave(); // Save after style changes
    },
    [state.spreadsheet, state.cellResultStore, debouncedSave]
  );

  const clearSpreadsheet = useCallback(() => {
    state.spreadsheet.clear();
    state.cellResultStore.clear();
    clearSpreadsheetState();
    setSelectedCell('A1');
    setCopiedCell(null);
    // No need to save - clearSpreadsheetState already clears localStorage
  }, [state.spreadsheet, state.cellResultStore]);

  const copyCell = useCallback(() => {
    state.spreadsheet.copyCell();
    setCopiedCell(state.spreadsheet.getCopiedCell());
  }, [state.spreadsheet]);

  const cutCell = useCallback(() => {
    if (!selectedCell) return;
    state.spreadsheet.cutCell();
    setCopiedCell(state.spreadsheet.getCopiedCell());
    state.evalEngine.onCellChanged(selectedCell);
    debouncedSave();
  }, [state.spreadsheet, state.evalEngine, selectedCell, debouncedSave]);

  const pasteCell = useCallback(() => {
    const success = state.spreadsheet.pasteCell();
    if (success && selectedCell) {
      state.evalEngine.onCellChanged(selectedCell);
      debouncedSave();
      // Clear the copied cell indicator after paste
      state.spreadsheet.clearClipboard();
      setCopiedCell(null);
    }
  }, [state.spreadsheet, state.evalEngine, selectedCell, debouncedSave]);

  const clearClipboard = useCallback(() => {
    state.spreadsheet.clearClipboard();
    setCopiedCell(null);
  }, [state.spreadsheet]);

  const fillRange = useCallback(
    (startCellId: CellID, endCellId: CellID) => {
      const affectedCells = state.spreadsheet.fillRange(startCellId, endCellId);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const insertColumnLeft = useCallback(
    (colIndex: number) => {
      const affectedCells = state.spreadsheet.insertColumnLeft(colIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const insertColumnRight = useCallback(
    (colIndex: number) => {
      const affectedCells = state.spreadsheet.insertColumnRight(colIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const insertRowAbove = useCallback(
    (rowIndex: number) => {
      const affectedCells = state.spreadsheet.insertRowAbove(rowIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const insertRowBelow = useCallback(
    (rowIndex: number) => {
      const affectedCells = state.spreadsheet.insertRowBelow(rowIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const deleteColumn = useCallback(
    (colIndex: number) => {
      const affectedCells = state.spreadsheet.deleteColumn(colIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const deleteRow = useCallback(
    (rowIndex: number) => {
      const affectedCells = state.spreadsheet.deleteRow(rowIndex);
      if (affectedCells.length > 0) {
        // Re-evaluate all affected cells
        affectedCells.forEach(cellId => {
          state.evalEngine.onCellChanged(cellId);
        });
        debouncedSave();
      }
    },
    [state.spreadsheet, state.evalEngine, debouncedSave]
  );

  const contextValue: SpreadsheetContextType = useMemo(
    () => ({
      ...state,
      selectedCell,
      copiedCell,
      selectCell,
      updateCell,
      setColumnWidth,
      setRowHeight,
      setCellFormat,
      updateCellStyle,
      clearSpreadsheet,
      copyCell,
      cutCell,
      pasteCell,
      clearClipboard,
      fillRange,
      insertColumnLeft,
      insertColumnRight,
      insertRowAbove,
      insertRowBelow,
      deleteColumn,
      deleteRow,
      formulaInputRef,
    }),
    [
      state,
      selectedCell,
      copiedCell,
      selectCell,
      updateCell,
      setColumnWidth,
      setRowHeight,
      setCellFormat,
      updateCellStyle,
      clearSpreadsheet,
      copyCell,
      cutCell,
      pasteCell,
      clearClipboard,
      fillRange,
      insertColumnLeft,
      insertColumnRight,
      insertRowAbove,
      insertRowBelow,
      deleteColumn,
      deleteRow,
      formulaInputRef,
    ]
  );

  return <SpreadsheetContext.Provider value={contextValue}>{children}</SpreadsheetContext.Provider>;
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
  }
  return context;
}
