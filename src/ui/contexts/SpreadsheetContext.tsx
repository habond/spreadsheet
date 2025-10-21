import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
import { useDebounce } from '../hooks/useDebounce';

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
  forceUpdate: () => void;
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
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const forceUpdate = useCallback(() => setUpdateTrigger(prev => prev + 1), []);

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
        cellResultStore.set(cellId, result);
        forceUpdate();
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
      forceUpdate();
      debouncedSave(); // Save after cell content changes
    },
    [state.spreadsheet, state.evalEngine, forceUpdate, debouncedSave]
  );

  const setColumnWidth = useCallback(
    (colIndex: number, width: number) => {
      state.spreadsheet.setColumnWidth(colIndex, width);
      forceUpdate();
      debouncedSave(); // Save after column width changes
    },
    [state.spreadsheet, forceUpdate, debouncedSave]
  );

  const setRowHeight = useCallback(
    (rowIndex: number, height: number) => {
      state.spreadsheet.setRowHeight(rowIndex, height);
      forceUpdate();
      debouncedSave(); // Save after row height changes
    },
    [state.spreadsheet, forceUpdate, debouncedSave]
  );

  const setCellFormat = useCallback(
    (cellId: CellID, format: CellFormat) => {
      state.spreadsheet.setCellFormat(cellId, format);
      forceUpdate();
      debouncedSave(); // Save after format changes
    },
    [state.spreadsheet, forceUpdate, debouncedSave]
  );

  const clearSpreadsheet = useCallback(() => {
    state.spreadsheet.clear();
    state.cellResultStore.clear();
    clearSpreadsheetState();
    setSelectedCell('A1');
    forceUpdate();
    // No need to save - clearSpreadsheetState already clears localStorage
  }, [state.spreadsheet, state.cellResultStore, forceUpdate]);

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
      forceUpdate,
      formulaInputRef,
    }),
    [
      state,
      selectedCell,
      updateTrigger, // Include updateTrigger to force context value updates
      selectCell,
      updateCell,
      setColumnWidth,
      setRowHeight,
      setCellFormat,
      clearSpreadsheet,
      forceUpdate,
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
