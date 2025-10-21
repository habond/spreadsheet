import { useRef } from 'react';
import { SpreadsheetProvider } from '../SpreadsheetContext';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ErrorBoundary } from './ErrorBoundary';

function SpreadsheetApp() {
  const formulaInputRef = useRef<HTMLInputElement>(null);
  useKeyboardNavigation(formulaInputRef);

  return (
    <div className="container">
      <FormulaBar ref={formulaInputRef} />
      <Grid />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SpreadsheetProvider rows={20} cols={10}>
        <SpreadsheetApp />
      </SpreadsheetProvider>
    </ErrorBoundary>
  );
}
