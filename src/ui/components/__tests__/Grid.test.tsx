import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { SpreadsheetProvider } from '../../contexts/SpreadsheetContext';
import { Grid } from '../Grid';

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

  describe('Column Resizing', () => {
    it('should trigger resize start on column handle mousedown', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.column-resize-handle');
      expect(resizeHandle).toBeInTheDocument();

      // Simulate mousedown on resize handle
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Test passes if no errors are thrown
      expect(resizeHandle).toBeInTheDocument();
    });

    it('should handle mouse movement during column resize', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.column-resize-handle');
      const container = document.querySelector('.spreadsheet-container');

      // Start resize
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Move mouse (simulate drag)
      await user.pointer({ coords: { clientX: 150, clientY: 0 }, target: container! });

      // Test passes if no errors are thrown
      expect(container).toBeInTheDocument();
    });

    it('should stop resizing on mouse up', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.column-resize-handle');
      const container = document.querySelector('.spreadsheet-container');

      // Start resize
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Release mouse
      await user.pointer({ keys: '[/MouseLeft]', target: container! });

      // Test passes if no errors are thrown
      expect(container).toBeInTheDocument();
    });

    it('should stop resizing on mouse leave', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.column-resize-handle');
      const container = document.querySelector('.spreadsheet-container') as Element;

      // Start resize
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Trigger mouse leave
      await user.unhover(container);

      // Test passes if no errors are thrown
      expect(container).toBeInTheDocument();
    });
  });

  describe('Row Resizing', () => {
    it('should trigger resize start on row handle mousedown', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.row-resize-handle');
      expect(resizeHandle).toBeInTheDocument();

      // Simulate mousedown on resize handle
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Test passes if no errors are thrown
      expect(resizeHandle).toBeInTheDocument();
    });

    it('should handle mouse movement during row resize', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.row-resize-handle');
      const container = document.querySelector('.spreadsheet-container');

      // Start resize
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Move mouse (simulate drag)
      await user.pointer({ coords: { clientX: 0, clientY: 50 }, target: container! });

      // Test passes if no errors are thrown
      expect(container).toBeInTheDocument();
    });

    it('should stop resizing on mouse up', async () => {
      const user = userEvent.setup();
      setup(2, 2);

      const resizeHandle = document.querySelector('.row-resize-handle');
      const container = document.querySelector('.spreadsheet-container');

      // Start resize
      await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

      // Release mouse
      await user.pointer({ keys: '[/MouseLeft]', target: container! });

      // Test passes if no errors are thrown
      expect(container).toBeInTheDocument();
    });
  });

  describe('Grid Styles', () => {
    it('should apply dynamic column widths to grid style', () => {
      setup(2, 2);

      const grid = document.querySelector('.grid') as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.style.gridTemplateColumns).toBeTruthy();
    });

    it('should apply dynamic row heights to grid style', () => {
      setup(2, 2);

      const grid = document.querySelector('.grid') as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.style.gridTemplateRows).toBeTruthy();
    });

    it('should apply dynamic column widths to column headers', () => {
      setup(2, 2);

      const columnHeaders = document.querySelector('.column-headers') as HTMLElement;
      expect(columnHeaders).toBeInTheDocument();
      expect(columnHeaders.style.gridTemplateColumns).toBeTruthy();
    });

    it('should apply dynamic row heights to row headers', () => {
      setup(2, 2);

      const rowHeaders = document.querySelector('.row-headers') as HTMLElement;
      expect(rowHeaders).toBeInTheDocument();
      expect(rowHeaders.style.gridTemplateRows).toBeTruthy();
    });
  });
});
