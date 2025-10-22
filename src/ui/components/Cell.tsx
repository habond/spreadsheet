import { CellID } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useCellValue } from '../hooks/useCellValue';

interface CellProps {
  cellId: CellID;
  row: number;
  col: number;
}

export function Cell({ cellId, row, col }: CellProps) {
  const { selectedCell, copiedCell, selectCell, formulaInputRef } = useSpreadsheet();

  // Use the optimized hook - only this cell will re-render when its value changes
  const { displayValue, error } = useCellValue(cellId);

  const isSelected = selectedCell === cellId;
  const isCopied = copiedCell === cellId;

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
      className={`cell${isSelected ? ' selected' : ''}${error ? ' error' : ''}${isCopied ? ' copied' : ''}`}
      data-cell-id={cellId}
      data-row={row}
      data-col={col}
      data-testid={`cell-${cellId}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={error || ''}
    >
      {displayValue}
    </div>
  );
}
