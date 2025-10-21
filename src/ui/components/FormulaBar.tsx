import { useState, useEffect, forwardRef, KeyboardEvent } from 'react';
import { useSpreadsheet } from '../SpreadsheetContext';
import { FunctionMenu } from './FunctionMenu';
import { InfoButton } from './InfoButton';
import { CellFormat } from '../../core/types';

export const FormulaBar = forwardRef<HTMLInputElement>(function FormulaBar(_props, ref) {
  const { spreadsheet, selectedCell, updateCell, selectCell, setCellFormat, clearSpreadsheet } =
    useSpreadsheet();
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

  const handleFunctionSelect = (functionName: string) => {
    setFormulaValue(`=${functionName}()`);
    // Focus the input and move cursor before closing paren
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.focus();
      // Set cursor position before the closing paren
      setTimeout(() => {
        if (ref && typeof ref !== 'function' && ref.current) {
          const cursorPos = functionName.length + 2; // =FUNC()
          ref.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearSpreadsheet();
      setFormulaValue('');
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedCell) return;
    const format = e.target.value as CellFormat;
    setCellFormat(selectedCell, format);
  };

  const currentFormat = selectedCell ? spreadsheet.getCellFormat(selectedCell) : CellFormat.Raw;

  return (
    <div className="formula-bar">
      <FunctionMenu onFunctionSelect={handleFunctionSelect} />
      <select
        className="format-dropdown"
        value={currentFormat}
        onChange={handleFormatChange}
        title="Cell format"
      >
        {Object.values(CellFormat).map(format => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
      <input
        ref={ref}
        type="text"
        id="formula-input"
        placeholder="Enter value or formula (e.g., =ADD(A1, B2))"
        value={formulaValue}
        onChange={e => setFormulaValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <InfoButton />
      <button className="clear-button" onClick={handleClear} title="Clear all data">
        Clear
      </button>
    </div>
  );
});
