import { useEffect, RefObject } from 'react';
import { useSpreadsheet } from '../SpreadsheetContext';

export function useKeyboardNavigation(formulaInputRef: RefObject<HTMLInputElement | null>) {
  const { spreadsheet, selectCell } = useSpreadsheet();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const formulaInput = formulaInputRef.current;

      // Only handle arrow keys when the formula input is focused
      if (document.activeElement !== formulaInput) {
        return;
      }

      let nextCellId: string | null = null;

      switch (e.key) {
        case 'ArrowUp':
          nextCellId = spreadsheet.navigateUp();
          e.preventDefault();
          break;
        case 'ArrowDown':
          nextCellId = spreadsheet.navigateDown();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          // Only navigate if cursor is at the beginning of the input
          if (
            formulaInput &&
            formulaInput.selectionStart === 0 &&
            formulaInput.selectionEnd === 0
          ) {
            nextCellId = spreadsheet.navigateLeft();
            e.preventDefault();
          }
          break;
        case 'ArrowRight':
          // Only navigate if cursor is at the end of the input
          if (
            formulaInput &&
            formulaInput.selectionStart === formulaInput.value.length &&
            formulaInput.selectionEnd === formulaInput.value.length
          ) {
            nextCellId = spreadsheet.navigateRight();
            e.preventDefault();
          }
          break;
      }

      if (nextCellId) {
        selectCell(nextCellId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spreadsheet, selectCell, formulaInputRef]);
}
