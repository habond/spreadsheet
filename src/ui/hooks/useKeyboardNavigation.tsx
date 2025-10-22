import { useEffect, RefObject } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

export function useKeyboardNavigation(formulaInputRef: RefObject<HTMLInputElement | null> | null) {
  const { spreadsheet, selectCell, selectedCell, updateCell } = useSpreadsheet();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const formulaInput = formulaInputRef?.current;
      const isFormulaInputFocused = document.activeElement === formulaInput;

      // Helper function to navigate and blur
      const navigateAndBlur = (getNextCell: () => string | null) => {
        const nextCellId = getNextCell();
        if (nextCellId) {
          selectCell(nextCellId);
          formulaInput?.blur();
        }
      };

      // Helper function to check if arrow key can navigate
      const canNavigateWithArrow = (key: string): boolean => {
        if (!formulaInput || !isFormulaInputFocused) return true;

        // ArrowUp and ArrowDown always navigate when formula input is focused
        if (key === 'ArrowUp' || key === 'ArrowDown') return true;

        // ArrowLeft navigates only if cursor is at the beginning
        if (key === 'ArrowLeft') {
          return formulaInput.selectionStart === 0 && formulaInput.selectionEnd === 0;
        }

        // ArrowRight navigates only if cursor is at the end
        if (key === 'ArrowRight') {
          return (
            formulaInput.selectionStart === formulaInput.value.length &&
            formulaInput.selectionEnd === formulaInput.value.length
          );
        }

        return false;
      };

      // Handle Tab and Shift+Tab for cell navigation (always)
      if (e.key === 'Tab' && selectedCell) {
        e.preventDefault();
        // Save current formula input value before navigating
        if (isFormulaInputFocused && formulaInput) {
          updateCell(selectedCell, formulaInput.value);
        }
        navigateAndBlur(() =>
          e.shiftKey ? spreadsheet.navigateLeft() : spreadsheet.navigateRight()
        );
        return;
      }

      // Handle Enter and Shift+Enter for cell navigation (always)
      if (e.key === 'Enter' && selectedCell) {
        e.preventDefault();
        // Save current formula input value before navigating
        if (isFormulaInputFocused && formulaInput) {
          updateCell(selectedCell, formulaInput.value);
        }
        navigateAndBlur(() => (e.shiftKey ? spreadsheet.navigateUp() : spreadsheet.navigateDown()));
        return;
      }

      // Handle arrow key navigation
      const isArrowKey =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight';

      if (isArrowKey && selectedCell && canNavigateWithArrow(e.key)) {
        const navigationMap: Record<string, () => string | null> = {
          ArrowUp: () => spreadsheet.navigateUp(),
          ArrowDown: () => spreadsheet.navigateDown(),
          ArrowLeft: () => spreadsheet.navigateLeft(),
          ArrowRight: () => spreadsheet.navigateRight(),
        };

        e.preventDefault();
        navigateAndBlur(navigationMap[e.key]);
        return;
      }

      // Handle typing to focus the formula input (only when not focused)
      if (selectedCell && !isFormulaInputFocused && formulaInput) {
        const isPrintableKey =
          e.key.length === 1 || // Single character keys
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === '=' || // Formula start
          e.key === '+' ||
          e.key === '-';

        // Don't intercept modifier key combinations (Cmd+C, Ctrl+V, etc.)
        const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

        if (isPrintableKey && !hasModifier) {
          // If it's backspace or delete, clear the cell contents
          if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            updateCell(selectedCell, '');
            // Also immediately update the formula input DOM value for instant visual feedback
            formulaInput.value = '';
          } else {
            // For other keys, clear the cell, focus input, and replace with typed character
            e.preventDefault();
            formulaInput.value = e.key;
            formulaInput.focus();
            // Move cursor to end of input
            formulaInput.setSelectionRange(e.key.length, e.key.length);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spreadsheet, selectCell, selectedCell, updateCell, formulaInputRef]);
}
