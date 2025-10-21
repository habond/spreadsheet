import { useSpreadsheet } from '../SpreadsheetContext';

export function InfoDisplay() {
  const { spreadsheet, cellResultStore, selectedCell } = useSpreadsheet();

  if (!selectedCell) {
    return (
      <div className="info">
        <p>
          Supported formula: <code>=ADD(A1, B2)</code>
        </p>
        <p>
          Current cell: <span id="current-cell">-</span>
        </p>
        <p>
          Cell value: <span id="cell-value">-</span>
        </p>
      </div>
    );
  }

  const result = cellResultStore.get(selectedCell);
  const content = spreadsheet.getCellContent(selectedCell);
  const displayValue = cellResultStore.getDisplayValue(selectedCell) || content || '(empty)';

  return (
    <div className="info">
      <p>
        Supported formula: <code>=ADD(A1, B2)</code>
      </p>
      <p>
        Current cell: <span id="current-cell">{selectedCell}</span>
      </p>
      <p>
        Cell value: <span id="cell-value">{displayValue}</span>
      </p>
      {result?.error && (
        <p id="error-display" className="error-message">
          Error: {result.error}
        </p>
      )}
    </div>
  );
}
