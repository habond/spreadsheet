import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Spreadsheet } from '../data/spreadsheet';
import { EvalEngine } from '../core/eval-engine';
import { CellResultStore } from '../data/cell-result-store';
import { CellID, CellFormat } from '../core/types';
import {
  loadSpreadsheetState,
  saveSpreadsheetState,
  clearSpreadsheetState,
} from '../data/local-storage';

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
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

interface SpreadsheetProviderProps {
  children: ReactNode;
  rows?: number;
  cols?: number;
}

export function SpreadsheetProvider({ children, rows = 20, cols = 10 }: SpreadsheetProviderProps) {
  const [, setUpdateTrigger] = useState(0);
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

  const selectCell = useCallback(
    (cellId: CellID) => {
      state.spreadsheet.selectCell(cellId);
      setSelectedCell(cellId);
    },
    [state.spreadsheet]
  );

  const updateCell = useCallback(
    (cellId: CellID, content: string) => {
      state.spreadsheet.setCellContent(cellId, content);
      state.evalEngine.onCellChanged(cellId);
      forceUpdate();
    },
    [state.spreadsheet, state.evalEngine, forceUpdate]
  );

  const setColumnWidth = useCallback(
    (colIndex: number, width: number) => {
      state.spreadsheet.setColumnWidth(colIndex, width);
      forceUpdate();
    },
    [state.spreadsheet, forceUpdate]
  );

  const setRowHeight = useCallback(
    (rowIndex: number, height: number) => {
      state.spreadsheet.setRowHeight(rowIndex, height);
      forceUpdate();
    },
    [state.spreadsheet, forceUpdate]
  );

  const setCellFormat = useCallback(
    (cellId: CellID, format: CellFormat) => {
      state.spreadsheet.setCellFormat(cellId, format);
      forceUpdate();
    },
    [state.spreadsheet, forceUpdate]
  );

  const clearSpreadsheet = useCallback(() => {
    state.spreadsheet.clear();
    state.cellResultStore.clear();
    clearSpreadsheetState();
    setSelectedCell('A1');
    forceUpdate();
  }, [state.spreadsheet, state.cellResultStore, forceUpdate]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = state.spreadsheet.exportState();
    saveSpreadsheetState(stateToSave);
  });

  const contextValue: SpreadsheetContextType = {
    ...state,
    selectedCell,
    selectCell,
    updateCell,
    setColumnWidth,
    setRowHeight,
    setCellFormat,
    clearSpreadsheet,
    forceUpdate,
  };

  return <SpreadsheetContext.Provider value={contextValue}>{children}</SpreadsheetContext.Provider>;
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
  }
  return context;
}
