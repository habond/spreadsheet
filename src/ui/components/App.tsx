import { useRef } from 'react';
import { SpreadsheetProvider, useSpreadsheet } from '../SpreadsheetContext';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ErrorBoundary } from './ErrorBoundary';

function SpreadsheetApp() {
  const { formulaInputRef } = useSpreadsheet();
  useKeyboardNavigation(formulaInputRef);

  return (
    <div className="container">
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
