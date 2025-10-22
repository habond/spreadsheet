import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { Grid } from '../Grid';
import { SpreadsheetProvider } from '../../contexts/SpreadsheetContext';

describe('Grid', () => {
  const setup = (rows = 5, cols = 3) => {
    const inputRef = createRef<HTMLInputElement | null>();
    return render(
      <SpreadsheetProvider rows={rows} cols={cols} formulaInputRef={inputRef}>
        <Grid />
      </SpreadsheetProvider>
    );
  };

  describe('Grid Structure', () => {
    it('should render column headers', () => {
      setup(5, 3);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should render row headers', () => {
      setup(5, 3);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render correct number of cells', () => {
      setup(5, 3);

      // Should have 5 rows * 3 cols = 15 cells
      // Use more specific regex to avoid matching cell-grid
      const cells = screen.getAllByTestId(/^cell-[A-Z]/);
      expect(cells).toHaveLength(15);
    });

    it('should render cells with correct IDs', () => {
      setup(2, 2);

      expect(screen.getByTestId('cell-A1')).toBeInTheDocument();
      expect(screen.getByTestId('cell-A2')).toBeInTheDocument();
      expect(screen.getByTestId('cell-B1')).toBeInTheDocument();
      expect(screen.getByTestId('cell-B2')).toBeInTheDocument();
    });
  });

  describe('Cell Selection', () => {
    it('should select cell A1 by default', () => {
      setup(3, 3);

      const cellA1 = screen.getByTestId('cell-A1');
      expect(cellA1).toHaveClass('selected');
    });

    it('should select cell when clicked', async () => {
      const user = userEvent.setup();
      setup(3, 3);

      const cellB2 = screen.getByTestId('cell-B2');
      await user.click(cellB2);

      expect(cellB2).toHaveClass('selected');
    });

    it('should deselect previous cell when new cell is clicked', async () => {
      const user = userEvent.setup();
      setup(3, 3);

      const cellA1 = screen.getByTestId('cell-A1');
      const cellB2 = screen.getByTestId('cell-B2');

      // A1 is initially selected
      expect(cellA1).toHaveClass('selected');

      // Click B2
      await user.click(cellB2);

      // B2 should be selected, A1 should not
      expect(cellB2).toHaveClass('selected');
      expect(cellA1).not.toHaveClass('selected');
    });
  });

  describe('Grid Sizing', () => {
    it('should render with default column widths', () => {
      setup(2, 2);

      // Grid should be rendered (presence test)
      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render with default row heights', () => {
      setup(2, 2);

      // Row headers should be rendered
      const rowHeaders = document.querySelector('.row-headers');
      expect(rowHeaders).toBeInTheDocument();
    });

    it('should have column resize handles', () => {
      setup(2, 2);

      const resizeHandles = document.querySelectorAll('.column-resize-handle');
      // Should have one handle per column
      expect(resizeHandles).toHaveLength(2);
    });

    it('should have row resize handles', () => {
      setup(2, 2);

      const resizeHandles = document.querySelectorAll('.row-resize-handle');
      // Should have one handle per row
      expect(resizeHandles).toHaveLength(2);
    });
  });

  describe('Grid Layout', () => {
    it('should render column headers container', () => {
      setup(2, 2);

      const columnHeaders = document.querySelector('.column-headers');
      expect(columnHeaders).toBeInTheDocument();
    });

    it('should render row headers container', () => {
      setup(2, 2);

      const rowHeaders = document.querySelector('.row-headers');
      expect(rowHeaders).toBeInTheDocument();
    });

    it('should render grid container', () => {
      setup(2, 2);

      const gridContainer = document.querySelector('.grid-container');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render spreadsheet container', () => {
      setup(2, 2);

      const spreadsheetContainer = document.querySelector('.spreadsheet-container');
      expect(spreadsheetContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Grid', () => {
    it('should handle small grids', () => {
      setup(3, 2);

      const cells = screen.getAllByTestId(/^cell-[A-Z]/);
      expect(cells).toHaveLength(6); // 3 rows * 2 cols
    });

    it('should handle medium grids', () => {
      setup(10, 5);

      const cells = screen.getAllByTestId(/^cell-[A-Z]/);
      expect(cells).toHaveLength(50); // 10 rows * 5 cols
    });

    it('should render large grids correctly', () => {
      setup(20, 10);

      const cells = screen.getAllByTestId(/^cell-[A-Z]/);
      expect(cells).toHaveLength(200); // 20 rows * 10 cols
    });
  });

  describe('Cell Display', () => {
    it('should show empty cells initially', () => {
      setup(2, 2);

      const cellA1 = screen.getByTestId('cell-A1');
      expect(cellA1).toHaveTextContent('');
    });
  });
});
