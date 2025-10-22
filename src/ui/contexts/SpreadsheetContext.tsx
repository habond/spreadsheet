import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  RefObject,
} from 'react';
import { Spreadsheet } from '../../model/spreadsheet';
import { EvalEngine } from '../../engine/eval-engine';
import { CellResultStore } from '../../model/cell-result-store';
import { CellID, CellFormat } from '../../types/core';
import {
  loadSpreadsheetState,
  saveSpreadsheetState,
  clearSpreadsheetState,
} from '../../model/local-storage';

interface SpreadsheetContextType {
  spreadsheet: Spreadsheet;
  evalEngine: EvalEngine;
  cellResultStore: CellResultStore;
  selectedCell: CellID | null;
  selectCell: (cellId: CellID) => void;
  updateCell: (cellId: CellID, content: string) => void;
  setColumnWidth: (colIndex: number, width: number) => void;
  setRowHeight: (rowIndex: number, height: number) => void;
  setCellFormat: (cellId: CellID, format: CellFormat) => void;
  clearSpreadsheet: () => void;
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
        evalEngine.onCellChanged(cellId as CellID);
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

  const clearSpreadsheet = useCallback(() => {
    state.spreadsheet.clear();
    state.cellResultStore.clear();
    clearSpreadsheetState();
    setSelectedCell('A1');
    // No need to save - clearSpreadsheetState already clears localStorage
  }, [state.spreadsheet, state.cellResultStore]);

  const contextValue: SpreadsheetContextType = useMemo(
    () => ({
      ...state,
      selectedCell,
      selectCell,
      updateCell,
      setColumnWidth,
      setRowHeight,
      setCellFormat,
      clearSpreadsheet,
      formulaInputRef,
    }),
    [
      state,
      selectedCell,
      selectCell,
      updateCell,
      setColumnWidth,
      setRowHeight,
      setCellFormat,
      clearSpreadsheet,
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
