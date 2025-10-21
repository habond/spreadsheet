import { useRef } from 'react';
import { SpreadsheetProvider } from '../SpreadsheetContext';
import { InfoDisplay } from './InfoDisplay';
import { Grid } from './Grid';
import { FormulaBar } from './FormulaBar';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

function SpreadsheetApp() {
  const formulaInputRef = useRef<HTMLInputElement>(null);
  useKeyboardNavigation(formulaInputRef);

  return (
    <div className="container">
      <h1>Simple Spreadsheet</h1>
      <InfoDisplay />
      <Grid />
      <FormulaBar ref={formulaInputRef} />
    </div>
  );
}

export function App() {
  return (
    <SpreadsheetProvider rows={20} cols={10}>
      <SpreadsheetApp />
    </SpreadsheetProvider>
  );
}
