import { useState, useEffect, forwardRef } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { FunctionMenu } from './FunctionMenu';
import { InfoButton } from './InfoButton';
import { CellFormat } from '../../types/core';

export const FormulaBar = forwardRef<HTMLInputElement>(function FormulaBar(_props, ref) {
  const { spreadsheet, selectedCell, setCellFormat } = useSpreadsheet();
  const [formulaValue, setFormulaValue] = useState('');
  const [currentFormat, setCurrentFormat] = useState<CellFormat>(CellFormat.Raw);

  // Update formula value and format when selected cell changes or cell content changes
  useEffect(() => {
    if (selectedCell) {
      const content = spreadsheet.getCellContent(selectedCell);
      const format = spreadsheet.getCellFormat(selectedCell);
      setFormulaValue(content);
      setCurrentFormat(format);
    }
  }, [selectedCell, spreadsheet, spreadsheet.getCellContent(selectedCell || 'A1')]);

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
    </div>
  );
});
