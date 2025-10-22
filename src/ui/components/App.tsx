import { useRef } from 'react';
import { SpreadsheetProvider, useSpreadsheet } from '../contexts/SpreadsheetContext';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ErrorBoundary } from './ErrorBoundary';

function SpreadsheetApp() {
  const { formulaInputRef, clearSpreadsheet } = useSpreadsheet();
  useKeyboardNavigation(formulaInputRef);

  const handleClearSpreadsheet = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearSpreadsheet();
    }
  };

  return (
    <div className="container">
      <div className="toolbar">
        <h1 className="app-title">Spreadsheet</h1>
        <button
          className="clear-spreadsheet-button"
          onClick={handleClearSpreadsheet}
          title="Clear all spreadsheet data"
        >
          Clear Spreadsheet
        </button>
      </div>
      <FormulaBar ref={formulaInputRef} />
      <Grid />
    </div>
  );
}

export function App() {
  const formulaInputRef = useRef<HTMLInputElement>(null);

  return (
    <ErrorBoundary>
      <SpreadsheetProvider rows={20} cols={10} formulaInputRef={formulaInputRef}>
        <SpreadsheetApp />
      </SpreadsheetProvider>
    </ErrorBoundary>
  );
}
