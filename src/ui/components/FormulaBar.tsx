import { useState, useEffect, forwardRef, KeyboardEvent } from 'react';
import { useSpreadsheet } from '../SpreadsheetContext';

export const FormulaBar = forwardRef<HTMLInputElement>(function FormulaBar(_props, ref) {
  const { spreadsheet, selectedCell, updateCell, selectCell } = useSpreadsheet();
  const [formulaValue, setFormulaValue] = useState('');

  // Update formula value when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const content = spreadsheet.getCellContent(selectedCell);
      setFormulaValue(content);
      // Focus the input if it's a ref object
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.focus();
      }
    }
  }, [selectedCell, spreadsheet, ref]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return;

    // Update the cell content
    updateCell(selectedCell, formulaValue);

    // Navigate to next cell
    let nextCellId: string | null = null;

    if (e.key === 'Enter') {
      nextCellId = spreadsheet.navigateDown();
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        nextCellId = spreadsheet.navigateLeft();
      } else {
        nextCellId = spreadsheet.navigateRight();
      }
    }

    if (nextCellId) {
      selectCell(nextCellId);
    }
  };

  return (
    <div className="formula-bar">
      <label htmlFor="formula-input">Formula Bar:</label>
      <input
        ref={ref}
        type="text"
        id="formula-input"
        placeholder="Enter value or formula (e.g., =ADD(A1, B2))"
        value={formulaValue}
        onChange={e => setFormulaValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});
