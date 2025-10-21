import { useState, useEffect, forwardRef } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { FunctionMenu } from './FunctionMenu';
import { InfoButton } from './InfoButton';
import { CellFormat } from '../../types/core';

export const FormulaBar = forwardRef<HTMLInputElement>(function FormulaBar(_props, ref) {
  const { spreadsheet, selectedCell, setCellFormat, clearSpreadsheet } = useSpreadsheet();
  const [formulaValue, setFormulaValue] = useState('');
  const [currentFormat, setCurrentFormat] = useState<CellFormat>(CellFormat.Raw);

  // Update formula value and format when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const content = spreadsheet.getCellContent(selectedCell);
      const format = spreadsheet.getCellFormat(selectedCell);
      setFormulaValue(content);
      setCurrentFormat(format);
    }
  }, [selectedCell, spreadsheet]);

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
    setCurrentFormat(format);
    setCellFormat(selectedCell, format);
  };

  return (
    <div className="formula-bar">
      <FunctionMenu onFunctionSelect={handleFunctionSelect} />
      <select
        className="format-dropdown"
        value={currentFormat}
        onChange={handleFormatChange}
        title="Cell format"
      >
        <option value={CellFormat.Raw}>{CellFormat.Raw}</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Number}>{CellFormat.Number}</option>
        <option value={CellFormat.Currency}>{CellFormat.Currency}</option>
        <option value={CellFormat.Percentage}>{CellFormat.Percentage}</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Date}>{CellFormat.Date}</option>
        <option value={CellFormat.Time}>{CellFormat.Time}</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Boolean}>{CellFormat.Boolean}</option>
      </select>
      <input
        ref={ref}
        type="text"
        id="formula-input"
        placeholder="Enter value or formula (e.g., =ADD(A1, B2))"
        value={formulaValue}
        onChange={e => setFormulaValue(e.target.value)}
        autoComplete="off"
      />
      <InfoButton />
      <button className="clear-button" onClick={handleClear} title="Clear all data">
        Clear
      </button>
    </div>
  );
});
