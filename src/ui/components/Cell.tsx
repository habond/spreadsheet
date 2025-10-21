import { CellID } from '../../core/types';
import { useSpreadsheet } from '../SpreadsheetContext';

interface CellProps {
  cellId: CellID;
  row: number;
  col: number;
}

export function Cell({ cellId, row, col }: CellProps) {
  const { cellResultStore, selectedCell, selectCell } = useSpreadsheet();

  const result = cellResultStore.get(cellId);
  const displayValue = cellResultStore.getDisplayValue(cellId);
  const isSelected = selectedCell === cellId;

  const handleClick = () => {
    selectCell(cellId);
  };

  return (
    <div
      className={`cell${isSelected ? ' selected' : ''}${result?.error ? ' error' : ''}`}
      data-cell-id={cellId}
      data-row={row}
      data-col={col}
      data-testid={`cell-${cellId}`}
      onClick={handleClick}
      title={result?.error || ''}
    >
      {displayValue}
    </div>
  );
}
