import { useSpreadsheet } from '../SpreadsheetContext';

export function InfoDisplay() {
  const { spreadsheet, cellResultStore, selectedCell } = useSpreadsheet();

  if (!selectedCell) {
    return (
      <div className="info">
        <p>
          Current cell: <span id="current-cell">-</span>
        </p>
        <p>
          Raw value: <span id="raw-value">-</span>
        </p>
        <p>
          Display value: <span id="cell-value">-</span>
        </p>
      </div>
    );
  }

  const result = cellResultStore.get(selectedCell);
  const rawValue = spreadsheet.getCellContent(selectedCell) || '(empty)';
  const displayValue = cellResultStore.getDisplayValue(selectedCell) || rawValue;

  return (
    <div className="info">
      <p>
        Current cell: <span id="current-cell">{selectedCell}</span>
      </p>
      <p>
        Raw value: <span id="raw-value">{rawValue}</span>
      </p>
      <p>
        Display value: <span id="cell-value">{displayValue}</span>
      </p>
      {result?.error && (
        <p id="error-display" className="error-message">
          Error: {result.error}
        </p>
      )}
    </div>
  );
}
