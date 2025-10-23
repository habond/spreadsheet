import { type MouseEvent, useCallback, useMemo, useState } from 'react';
import type { CellID } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { Cell } from './Cell';
import { GridHeaderContextMenu } from './GridHeaderContextMenu';

export function Grid() {
  const { spreadsheet, setColumnWidth, setRowHeight, fillRange } = useSpreadsheet();
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  // Fill handle drag state
  const [fillDragging, setFillDragging] = useState(false);
  const [fillStartCell, setFillStartCell] = useState<CellID | null>(null);
  const [fillEndCell, setFillEndCell] = useState<CellID | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'column' | 'row';
    index: number;
  } | null>(null);

  // Local state to trigger re-renders when sizes change
  // eslint-disable-next-line react/hook-use-state
  const [, setRenderTrigger] = useState(0);
  const forceRender = useCallback(() => setRenderTrigger(prev => prev + 1), []);

  const rows = spreadsheet.rows;
  const cols = spreadsheet.cols;
  const columnWidths = spreadsheet.getAllColumnWidths();
  const rowHeights = spreadsheet.getAllRowHeights();

  // Compute which cells should be highlighted during fill drag
  const fillHighlightCells = useMemo(() => {
    if (!fillDragging || !fillStartCell || !fillEndCell) return new Set<CellID>();

    const cells = spreadsheet.getFillRangeCells(fillStartCell, fillEndCell);
    return new Set(cells);
  }, [fillDragging, fillStartCell, fillEndCell, spreadsheet]);

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

  const handleFillHandleStart = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('fill-handle')) {
        e.preventDefault();
        e.stopPropagation(); // Prevent cell click handler from firing
        const selectedCell = spreadsheet.getSelectedCell();
        if (selectedCell) {
          setFillDragging(true);
          setFillStartCell(selectedCell);
          setFillEndCell(selectedCell);
        }
      }
    },
    [spreadsheet]
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizingColumn !== null) {
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;
      setColumnWidth(resizingColumn, newWidth);
      forceRender(); // Re-render Grid to show new size
    } else if (resizingRow !== null) {
      const delta = e.clientY - startY;
      const newHeight = startHeight + delta;
      setRowHeight(resizingRow, newHeight);
      forceRender(); // Re-render Grid to show new size
    } else if (fillDragging) {
      // Track which cell the mouse is over during fill drag
      const target = e.target as HTMLElement;
      const cell = target.closest('[data-cell-id]');
      if (cell) {
        const cellId = cell.getAttribute('data-cell-id') as CellID;
        setFillEndCell(cellId);
      }
    }
  };

  const handleMouseUp = () => {
    // Handle resize end
    if (resizingColumn !== null || resizingRow !== null) {
      setResizingColumn(null);
      setResizingRow(null);
    }

    // Handle fill drag end
    if (fillDragging && fillStartCell && fillEndCell) {
      fillRange(fillStartCell, fillEndCell);
      setFillDragging(false);
      setFillStartCell(null);
      setFillEndCell(null);
    } else if (fillDragging) {
      // Cancel drag if no end cell
      setFillDragging(false);
      setFillStartCell(null);
      setFillEndCell(null);
    }
  };

  const handleColumnContextMenu = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'column',
      index: col,
    });
  };

  const handleRowContextMenu = (row: number, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'row',
      index: row,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Container for fill handle drag interaction
    <div
      className="spreadsheet-container"
      onMouseDownCapture={handleFillHandleStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="column-headers" style={columnHeadersStyle} data-testid="column-headers">
        {/* Empty corner cell */}
        <div className="column-header" />
        {/* Column headers (A, B, C, ...) */}
        {Array.from({ length: cols }, (_, col) => (
          <div
            key={col}
            className="column-header"
            role="button"
            tabIndex={0}
            onContextMenu={e => handleColumnContextMenu(col, e)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleColumnContextMenu(col, e as unknown as React.MouseEvent);
              }
            }}
            aria-label={`Column ${spreadsheet.columnIndexToLetter(col)}`}
          >
            {spreadsheet.columnIndexToLetter(col)}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Separator is interactive for resizing */}
            <div
              role="separator"
              aria-label={`Resize column ${spreadsheet.columnIndexToLetter(col)}`}
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
            <div
              key={row}
              className="row-header"
              role="button"
              tabIndex={0}
              onContextMenu={e => handleRowContextMenu(row, e)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRowContextMenu(row, e as unknown as React.MouseEvent);
                }
              }}
              aria-label={`Row ${row + 1}`}
            >
              {row + 1}
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Separator is interactive for resizing */}
              <div
                role="separator"
                aria-label={`Resize row ${row + 1}`}
                className="row-resize-handle"
                onMouseDown={e => handleRowResizeStart(row, e)}
              />
            </div>
          ))}
        </div>
        <div className="grid" style={gridStyle} data-testid="cell-grid">
          {/* Grid cells */}
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const cellId = spreadsheet.getCellId(row, col);
              const isFillHighlighted = fillHighlightCells.has(cellId);
              return (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  row={row}
                  col={col}
                  isFillHighlighted={isFillHighlighted}
                />
              );
            })
          )}
        </div>
      </div>
      {contextMenu && (
        <GridHeaderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          index={contextMenu.index}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
