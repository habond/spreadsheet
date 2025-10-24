import { Info } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useClickOutside } from '../hooks/useClickOutside';

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { spreadsheet, cellResultStore, selectedCell } = useSpreadsheet();

  const handleClose = useCallback(() => setIsOpen(false), []);
  useClickOutside(popoverRef, isOpen ? handleClose : () => {});

  // Cell info display logic
  const cellId = selectedCell || '-';
  const rawValue = selectedCell ? spreadsheet.getCellContent(selectedCell) || '(empty)' : '-';
  const result = selectedCell ? cellResultStore.get(selectedCell) : null;
  const displayValue = selectedCell
    ? cellResultStore.getDisplayValue(selectedCell) || rawValue
    : '-';

  return (
    <div className="info-button-container" ref={popoverRef}>
      <button className="info-button" onClick={() => setIsOpen(!isOpen)} title="Show cell info">
        <Info size={16} />
      </button>
      {isOpen && (
        <div className="info-popover">
          <div className="info">
            <p>
              Current cell: <span id="current-cell">{cellId}</span>
            </p>
            <p>
              Raw value: <span id="raw-value">{rawValue}</span>
            </p>
            <p>
              Display value: <span id="cell-value">{displayValue}</span>
            </p>
            {result?.error && (
              <p id="error-display" className="error-message">
                Error: {result.error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
