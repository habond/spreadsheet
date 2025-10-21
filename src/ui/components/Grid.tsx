import { useState, MouseEvent, useMemo } from 'react';
import { useSpreadsheet } from '../SpreadsheetContext';
import { Cell } from './Cell';

export function Grid() {
  const { spreadsheet, setColumnWidth, setRowHeight } = useSpreadsheet();
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const rows = spreadsheet.rows;
  const cols = spreadsheet.cols;
  const columnWidths = spreadsheet.getAllColumnWidths();
  const rowHeights = spreadsheet.getAllRowHeights();

  const handleColumnResizeStart = (col: number, e: MouseEvent) => {
    e.preventDefault();
    setResizingColumn(col);
    setStartX(e.clientX);
    setStartWidth(spreadsheet.getColumnWidth(col));
  };

  const handleRowResizeStart = (row: number, e: MouseEvent) => {
    e.preventDefault();
    setResizingRow(row);
    setStartY(e.clientY);
    setStartHeight(spreadsheet.getRowHeight(row));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizingColumn !== null) {
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;
      setColumnWidth(resizingColumn, newWidth);
    } else if (resizingRow !== null) {
      const delta = e.clientY - startY;
      const newHeight = startHeight + delta;
      setRowHeight(resizingRow, newHeight);
    }
  };

  const handleMouseUp = () => {
    setResizingColumn(null);
    setResizingRow(null);
  };

  const columnHeadersStyle = useMemo(
    () => ({
      gridTemplateColumns: `40px ${columnWidths.map(w => `${w}px`).join(' ')}`,
    }),
    [columnWidths]
  );

  const rowHeadersStyle = useMemo(
    () => ({
      gridTemplateRows: rowHeights.map(h => `${h}px`).join(' '),
    }),
    [rowHeights]
  );

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: columnWidths.map(w => `${w}px`).join(' '),
      gridTemplateRows: rowHeights.map(h => `${h}px`).join(' '),
    }),
    [columnWidths, rowHeights]
  );

  return (
    <div
      className="spreadsheet-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="column-headers" style={columnHeadersStyle}>
        {/* Empty corner cell */}
        <div className="column-header" />
        {/* Column headers (A, B, C, ...) */}
        {Array.from({ length: cols }, (_, col) => (
          <div key={col} className="column-header">
            {spreadsheet.columnIndexToLetter(col)}
            <div
              className="column-resize-handle"
              onMouseDown={e => handleColumnResizeStart(col, e)}
            />
          </div>
        ))}
      </div>
      <div className="grid-container">
        <div className="row-headers" style={rowHeadersStyle}>
          {/* Row headers (1, 2, 3, ...) */}
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="row-header">
              {row + 1}
              <div className="row-resize-handle" onMouseDown={e => handleRowResizeStart(row, e)} />
            </div>
          ))}
        </div>
        <div className="grid" style={gridStyle}>
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
