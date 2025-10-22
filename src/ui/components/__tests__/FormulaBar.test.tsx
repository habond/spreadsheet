import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { FormulaBar } from '../FormulaBar';
import { SpreadsheetProvider, useSpreadsheet } from '../../contexts/SpreadsheetContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

/**
 * FormulaBar Integration Tests
 *
 * These tests verify the FormulaBar component's integration with the keyboard navigation system.
 * The FormulaBar is responsible for:
 * - Displaying and editing cell content
 * - Managing cell format selection
 * - Updating its state when cells are selected
 *
 * Navigation (Enter, Tab, arrow keys) is handled by useKeyboardNavigation hook,
 * which saves the formula input value before navigating to the next cell.
 */

// Helper component to display the current selected cell and set up keyboard navigation
function TestHarness({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { selectedCell } = useSpreadsheet();
  useKeyboardNavigation(inputRef);
  return <div data-testid="selected-cell">{selectedCell}</div>;
}

describe('FormulaBar', () => {
  const setup = () => {
    const inputRef = createRef<HTMLInputElement | null>();
    const result = render(
      <SpreadsheetProvider rows={20} cols={10} formulaInputRef={inputRef}>
        <FormulaBar ref={inputRef} />
        <TestHarness inputRef={inputRef} />
      </SpreadsheetProvider>
    );
    return { ...result, inputRef };
  };

  describe('Integration with keyboard navigation', () => {
    it('should save value and navigate down when Enter is pressed', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);
      const selectedCell = screen.getByTestId('selected-cell');

      // Initially at A1
      expect(selectedCell).toHaveTextContent('A1');

      // Focus input and type something
      await user.click(input);
      await user.type(input, 'test');

      // Press Enter
      await user.keyboard('{Enter}');

      // Should now be at A2
      expect(selectedCell).toHaveTextContent('A2');
    });

    it('should save value and navigate up when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);
      const selectedCell = screen.getByTestId('selected-cell');

      // Start at A2 (need to navigate down first)
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(selectedCell).toHaveTextContent('A2');

      // Type something and press Shift+Enter
      await user.click(input);
      await user.type(input, 'test');
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // Should be back at A1
      expect(selectedCell).toHaveTextContent('A1');
    });

    it('should save cell value before navigating with Enter', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);
      const selectedCell = screen.getByTestId('selected-cell');

      // Type a value in A1
      await user.click(input);
      await user.type(input, '42');

      expect(selectedCell).toHaveTextContent('A1');

      // Press Enter to save and move down to A2
      await user.keyboard('{Enter}');
      expect(selectedCell).toHaveTextContent('A2');

      // Click input again to focus it and navigate back up with Shift+Enter
      await user.click(input);
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(selectedCell).toHaveTextContent('A1');

      // The input should now show the saved value from A1
      // Wait a bit for the useEffect to update
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(input).toHaveValue('42');
    });

    it('should blur formula input after Enter', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);

      await user.click(input);
      expect(document.activeElement).toBe(input);

      await user.keyboard('{Enter}');

      // Input should be blurred
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('Tab key integration', () => {
    it('should save value and navigate when Tab is pressed', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);

      // Type a value
      await user.click(input);
      await user.type(input, '100');

      // Press Tab (navigation handled by useKeyboardNavigation)
      await user.tab();

      // Navigate back with Shift+Tab
      await user.keyboard('{Shift>}{Tab}{/Shift}');

      // The input should show the saved value
      expect(input).toHaveValue('100');
    });
  });

  describe('Function selection', () => {
    it('should insert function when selected from menu', async () => {
      const user = userEvent.setup();
      setup();

      const input = screen.getByPlaceholderText(/enter value or formula/i);

      // Find and click the function menu button
      const functionButton = screen.getByText('ƒx');
      await user.click(functionButton);

      // Select SUM function
      const sumOption = screen.getByText('SUM');
      await user.click(sumOption);

      // Input should now have =SUM()
      expect(input).toHaveValue('=SUM()');
    });
  });

  describe('Format selection', () => {
    it('should change format when dropdown option selected', async () => {
      const user = userEvent.setup();
      setup();

      const formatDropdown = screen.getByTitle('Cell format');

      // Change to Number format
      await user.selectOptions(formatDropdown, 'Number');
      expect(formatDropdown).toHaveValue('Number');

      // Change to Currency format
      await user.selectOptions(formatDropdown, 'Currency');
      expect(formatDropdown).toHaveValue('Currency');
    });

    it('should update format for different formats', async () => {
      const user = userEvent.setup();
      setup();

      const formatDropdown = screen.getByTitle('Cell format');

      // Try different formats
      await user.selectOptions(formatDropdown, 'Percentage');
      expect(formatDropdown).toHaveValue('Percentage');

      await user.selectOptions(formatDropdown, 'Date');
      expect(formatDropdown).toHaveValue('Date');

      await user.selectOptions(formatDropdown, 'Boolean');
      expect(formatDropdown).toHaveValue('Boolean');
    });
  });
});
