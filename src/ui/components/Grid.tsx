import { useSpreadsheet } from '../SpreadsheetContext';
import { Cell } from './Cell';

export function Grid() {
  const { spreadsheet } = useSpreadsheet();

  const rows = spreadsheet.rows;
  const cols = spreadsheet.cols;

  return (
    <div className="spreadsheet-container">
      <div className="column-headers">
        {/* Empty corner cell */}
        <div className="column-header"></div>
        {/* Column headers (A, B, C, ...) */}
        {Array.from({ length: cols }, (_, col) => (
          <div key={col} className="column-header">
            {spreadsheet.columnIndexToLetter(col)}
          </div>
        ))}
      </div>
      <div className="grid-container">
        <div className="row-headers">
          {/* Row headers (1, 2, 3, ...) */}
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="row-header">
              {row + 1}
            </div>
          ))}
        </div>
        <div className="grid">
          {/* Grid cells */}
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const cellId = spreadsheet.getCellId(row, col);
              return <Cell key={cellId} cellId={cellId} row={row} col={col} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}
