import { useEffect, useRef } from 'react';
import { styleToCss } from '../../styles/cell-styles';
import type { CellID } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useCellValue } from '../hooks/useCellValue';

interface CellProps {
  cellId: CellID;
  row: number;
  col: number;
  isFillHighlighted?: boolean;
}

export function Cell({ cellId, row, col, isFillHighlighted = false }: CellProps) {
  const { selectedCell, copiedCell, selectCell, formulaInputRef } = useSpreadsheet();

  // Use the optimized hook - only this cell will re-render when its value OR style changes
  const { displayValue, error, style } = useCellValue(cellId);

  const isSelected = selectedCell === cellId;
  const isCopied = copiedCell === cellId;

  // Ref to the cell div element
  const cellRef = useRef<HTMLDivElement>(null);

  // Convert cell style to CSS
  const cellStyle = style ? styleToCss(style) : {};

  // Scroll the selected cell into view when it becomes selected
  useEffect(() => {
    if (isSelected && cellRef.current && cellRef.current.scrollIntoView) {
      cellRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isSelected]);

  const handleClick = () => {
    selectCell(cellId);
  };

  const handleDoubleClick = () => {
    if (formulaInputRef?.current) {
      formulaInputRef.current.focus();
    }
  };

  return (
    <div
      ref={cellRef}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      className={`cell${isSelected ? ' selected' : ''}${error ? ' error' : ''}${isCopied ? ' copied' : ''}${isFillHighlighted ? ' fill-highlight' : ''}`}
      style={cellStyle}
      data-cell-id={cellId}
      data-row={row}
      data-col={col}
      data-testid={`cell-${cellId}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      title={error || ''}
    >
      {displayValue}
      {isSelected && <div className="fill-handle" data-testid={`fill-handle-${cellId}`} />}
    </div>
  );
}
