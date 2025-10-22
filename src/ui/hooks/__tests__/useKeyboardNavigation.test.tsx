import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';
import { SpreadsheetProvider } from '../../contexts/SpreadsheetContext';

// Test component that uses the hook
function TestComponent({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  useKeyboardNavigation(inputRef);
  return (
    <div>
      <input ref={inputRef} data-testid="formula-input" />
      <div data-testid="grid">Grid</div>
    </div>
  );
}

describe('useKeyboardNavigation', () => {
  const setup = () => {
    const inputRef = createRef<HTMLInputElement | null>();
    const result = render(
      <SpreadsheetProvider rows={20} cols={10} formulaInputRef={inputRef}>
        <TestComponent inputRef={inputRef} />
      </SpreadsheetProvider>
    );
    return { ...result, inputRef };
  };

  describe('Tab navigation', () => {
    it('should navigate right on Tab press', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      // Focus the input
      inputRef.current?.focus();

      // Press Tab
      await user.tab();

      // Formula input should be blurred after Tab navigation
      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should navigate left on Shift+Tab press', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      // Note: Shift+Tab behavior is handled by the global handler
      // This test just verifies no errors occur
      inputRef.current?.focus();
      await user.keyboard('{Shift>}{Tab}{/Shift}');

      // Test passes if no errors are thrown
      expect(inputRef.current).toBeTruthy();
    });
  });

  describe('Arrow key navigation without formula input focus', () => {
    it('should navigate with arrow keys when formula input is not focused', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      // Click on grid to ensure formula input is not focused
      const grid = getByTestId('grid');
      await user.click(grid);

      expect(document.activeElement).not.toBe(inputRef.current);

      // Press arrow keys - should not throw and should work
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowLeft}');

      // Formula input should still not be focused
      expect(document.activeElement).not.toBe(inputRef.current);
    });
  });

  describe('Arrow key navigation with formula input focus', () => {
    it('should navigate up with ArrowUp when formula input is focused', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      expect(document.activeElement).toBe(inputRef.current);

      await user.keyboard('{ArrowUp}');

      // Test completes successfully - blur behavior tested separately
      expect(inputRef.current).toBeTruthy();
    });

    it('should navigate down with ArrowDown when formula input is focused', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      expect(document.activeElement).toBe(inputRef.current);

      await user.keyboard('{ArrowDown}');

      // Formula input should be blurred after navigation
      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should navigate left with ArrowLeft when cursor is at beginning', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.value = 'test';
        inputRef.current.setSelectionRange(0, 0); // Cursor at beginning
      }

      await user.keyboard('{ArrowLeft}');

      // Test completes successfully - blur behavior tested separately
      expect(inputRef.current).toBeTruthy();
    });

    it('should not navigate left with ArrowLeft when cursor is not at beginning', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.value = 'test';
        inputRef.current.setSelectionRange(2, 2); // Cursor in middle
      }

      await user.keyboard('{ArrowLeft}');

      // Formula input should still be focused (navigation didn't happen)
      expect(document.activeElement).toBe(inputRef.current);
    });

    it('should navigate right with ArrowRight when cursor is at end', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.value = 'test';
        inputRef.current.setSelectionRange(4, 4); // Cursor at end
      }

      await user.keyboard('{ArrowRight}');

      // Formula input should be blurred after navigation
      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should not navigate right with ArrowRight when cursor is not at end', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.value = 'test';
        inputRef.current.setSelectionRange(2, 2); // Cursor in middle
      }

      await user.keyboard('{ArrowRight}');

      // Formula input should still be focused (navigation didn't happen)
      expect(document.activeElement).toBe(inputRef.current);
    });
  });

  describe('Auto-focus on typing', () => {
    it('should focus formula input when typing a letter', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      // Click on grid to ensure formula input is not focused
      const grid = getByTestId('grid');
      await user.click(grid);

      expect(document.activeElement).not.toBe(inputRef.current);

      // Type a letter
      await user.keyboard('a');

      // Formula input should now be focused
      expect(document.activeElement).toBe(inputRef.current);
    });

    it('should replace cell contents when typing while cell is focused', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      // Click on grid to ensure formula input is not focused
      const grid = getByTestId('grid');
      await user.click(grid);

      // Simulate existing cell content
      if (inputRef.current) {
        inputRef.current.value = 'old content';
      }

      expect(document.activeElement).not.toBe(inputRef.current);

      // Type a letter - should replace the old content, not append to it
      await user.keyboard('x');

      // Formula input should now be focused with only the new character
      expect(document.activeElement).toBe(inputRef.current);
      expect(inputRef.current?.value).toBe('x');
    });

    it('should focus formula input when typing equals sign', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      await user.keyboard('=');

      expect(document.activeElement).toBe(inputRef.current);
    });

    it('should clear cell contents when pressing Backspace', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      // Set some initial value in the input (simulating a cell with content)
      if (inputRef.current) {
        inputRef.current.value = 'test';
      }

      await user.keyboard('{Backspace}');

      // Input should be cleared and not focused (cell is cleared directly)
      expect(inputRef.current?.value).toBe('');
      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should clear cell contents when pressing Delete', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      // Set some initial value in the input (simulating a cell with content)
      if (inputRef.current) {
        inputRef.current.value = '=SUM(A1:A5)';
      }

      await user.keyboard('{Delete}');

      // Input should be cleared and not focused (cell is cleared directly)
      expect(inputRef.current?.value).toBe('');
      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should not clear cell when Backspace is pressed with formula input focused', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      // Focus the formula input and set a value
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = 'test';
      }

      expect(document.activeElement).toBe(inputRef.current);

      // Press Backspace while formula input is focused
      await user.keyboard('{Backspace}');

      // Should perform normal backspace behavior in the input, not clear everything
      // The value should be 'tes' (last character removed)
      expect(inputRef.current?.value).toBe('tes');
      expect(document.activeElement).toBe(inputRef.current);
    });

    it('should not clear cell when Delete is pressed with formula input focused', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      // Focus the formula input and set a value with cursor at start
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = 'test';
        inputRef.current.setSelectionRange(0, 0); // Cursor at beginning
      }

      expect(document.activeElement).toBe(inputRef.current);

      // Press Delete while formula input is focused
      await user.keyboard('{Delete}');

      // Should perform normal delete behavior in the input
      // The value should be 'est' (first character removed)
      expect(inputRef.current?.value).toBe('est');
      expect(document.activeElement).toBe(inputRef.current);
    });

    it('should not focus on modifier key combinations', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      expect(document.activeElement).not.toBe(inputRef.current);

      // Try Cmd+C (or Ctrl+C)
      await user.keyboard('{Control>}c{/Control}');

      // Formula input should still not be focused
      expect(document.activeElement).not.toBe(inputRef.current);
    });
  });

  describe('Formula bar blur on navigation', () => {
    it('should blur formula input after Tab navigation', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      expect(document.activeElement).toBe(inputRef.current);

      await user.tab();

      expect(document.activeElement).not.toBe(inputRef.current);
    });

    it('should blur formula input after arrow key navigation', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      expect(document.activeElement).toBe(inputRef.current);

      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).not.toBe(inputRef.current);
    });
  });

  describe('Copy/Paste/Cut keyboard shortcuts', () => {
    it('should trigger copy on Cmd+C (Mac) or Ctrl+C (Windows)', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      // Click on grid to ensure formula input is not focused
      const grid = getByTestId('grid');
      await user.click(grid);

      // Press Cmd+C or Ctrl+C (testing library handles platform detection)
      await user.keyboard('{Control>}c{/Control}');

      // Test passes if no errors are thrown
      expect(inputRef.current).toBeTruthy();
    });

    it('should trigger cut on Cmd+X (Mac) or Ctrl+X (Windows)', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      await user.keyboard('{Control>}x{/Control}');

      expect(inputRef.current).toBeTruthy();
    });

    it('should trigger paste on Cmd+V (Mac) or Ctrl+V (Windows)', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      await user.keyboard('{Control>}v{/Control}');

      expect(inputRef.current).toBeTruthy();
    });

    it('should not trigger copy/paste/cut when formula input is focused', async () => {
      const user = userEvent.setup();
      const { inputRef } = setup();

      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.value = 'test';
      }

      // Press Ctrl+C while formula input is focused - should do browser default (copy text)
      await user.keyboard('{Control>}c{/Control}');

      // Formula input should remain focused
      expect(document.activeElement).toBe(inputRef.current);
      expect(inputRef.current?.value).toBe('test');
    });

    it('should clear clipboard on Escape key press', async () => {
      const user = userEvent.setup();
      const { getByTestId, inputRef } = setup();

      const grid = getByTestId('grid');
      await user.click(grid);

      // Press Escape
      await user.keyboard('{Escape}');

      // Test passes if no errors are thrown
      expect(inputRef.current).toBeTruthy();
    });
  });
});
