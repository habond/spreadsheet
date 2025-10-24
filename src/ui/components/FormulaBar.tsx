import { forwardRef, useEffect, useState } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { FunctionMenu } from './FunctionMenu';
import { InfoButton } from './InfoButton';

export const FormulaBar = forwardRef<HTMLInputElement>(function FormulaBar(_props, ref) {
  const { spreadsheet, selectedCell } = useSpreadsheet();
  const [formulaValue, setFormulaValue] = useState('');

  // Update formula value when selected cell changes or cell content changes
  useEffect(() => {
    if (selectedCell) {
      const content = spreadsheet.getCellContent(selectedCell);
      setFormulaValue(content);
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

  return (
    <div className="formula-bar">
      <FunctionMenu onFunctionSelect={handleFunctionSelect} />
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
