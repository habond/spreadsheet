import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { SpreadsheetProvider } from '../../contexts/SpreadsheetContext';
import { InfoButton } from '../InfoButton';

describe('InfoButton', () => {
  const setup = () => {
    const inputRef = createRef<HTMLInputElement | null>();
    return render(
      <SpreadsheetProvider rows={20} cols={10} formulaInputRef={inputRef}>
        <InfoButton />
      </SpreadsheetProvider>
    );
  };

  describe('Button rendering and interaction', () => {
    it('should render the info button', () => {
      setup();

      const button = screen.getByTitle(/show cell info/i);
      expect(button).toBeInTheDocument();
    });

    it('should not show popover initially', () => {
      setup();

      // InfoDisplay content should not be visible
      expect(screen.queryByText(/Current cell:/i)).not.toBeInTheDocument();
    });

    it('should show popover when button is clicked', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      // InfoDisplay should now be visible
      expect(screen.getByText(/Current cell:/i)).toBeInTheDocument();
      expect(screen.getByText(/Raw value:/i)).toBeInTheDocument();
      expect(screen.getByText(/Display value:/i)).toBeInTheDocument();
    });

    it('should hide popover when button is clicked again', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);

      // Open popover
      await user.click(button);
      expect(screen.getByText(/Current cell:/i)).toBeInTheDocument();

      // Close popover
      await user.click(button);
      expect(screen.queryByText(/Current cell:/i)).not.toBeInTheDocument();
    });

    it('should close popover when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SpreadsheetProvider rows={20} cols={10} formulaInputRef={createRef()}>
            <InfoButton />
          </SpreadsheetProvider>
          <button>Outside button</button>
        </div>
      );

      // Open popover
      const infoButton = screen.getByTitle(/show cell info/i);
      await user.click(infoButton);
      expect(screen.getByText(/Current cell:/i)).toBeInTheDocument();

      // Click outside
      const outsideButton = screen.getByRole('button', { name: /outside button/i });
      await user.click(outsideButton);

      // Popover should be closed
      expect(screen.queryByText(/Current cell:/i)).not.toBeInTheDocument();
    });
  });

  describe('Cell information display', () => {
    it('should display current cell ID when popover is open', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      // Check that cell info is displayed (A1 is auto-selected)
      expect(screen.getByText('A1')).toBeInTheDocument();
    });

    it('should display all information labels', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      expect(screen.getByText(/Current cell:/i)).toBeInTheDocument();
      expect(screen.getByText(/Raw value:/i)).toBeInTheDocument();
      expect(screen.getByText(/Display value:/i)).toBeInTheDocument();
    });

    it('should show "(empty)" when cell is empty', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      // Raw value should show (empty) for empty cells
      const emptyElement = screen.getAllByText('(empty)');
      expect(emptyElement.length).toBeGreaterThan(0);
    });

    it('should not display error message when cell has no error', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      // Initially no error
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });

    it('should render within info container', async () => {
      const user = userEvent.setup();
      setup();

      const button = screen.getByTitle(/show cell info/i);
      await user.click(button);

      const infoDiv = document.querySelector('.info');
      expect(infoDiv).toBeInTheDocument();
    });
  });
});
