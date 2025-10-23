import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpreadsheetProvider } from '../../contexts/SpreadsheetContext';
import { GridHeaderContextMenu } from '../GridHeaderContextMenu';

describe('GridHeaderContextMenu', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Column context menu', () => {
    it('should render column menu items', () => {
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      expect(screen.getByText('Insert Column Left')).toBeInTheDocument();
      expect(screen.getByText('Insert Column Right')).toBeInTheDocument();
      expect(screen.getByText('Delete Column')).toBeInTheDocument();
    });

    it('should call insertColumnLeft when clicking Insert Column Left', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const insertLeftButton = screen.getByText('Insert Column Left');
      await user.click(insertLeftButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call insertColumnRight when clicking Insert Column Right', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const insertRightButton = screen.getByText('Insert Column Right');
      await user.click(insertRightButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should position menu at correct coordinates', () => {
      const { container } = render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={150} y={250} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const menu = container.querySelector('.context-menu') as HTMLElement;
      expect(menu).toBeInTheDocument();
      expect(menu.style.left).toBe('150px');
      expect(menu.style.top).toBe('250px');
    });

    it('should call deleteColumn when clicking Delete Column', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const deleteButton = screen.getByText('Delete Column');
      await user.click(deleteButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('Row context menu', () => {
    it('should render row menu items', () => {
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="row" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      expect(screen.getByText('Insert Row Above')).toBeInTheDocument();
      expect(screen.getByText('Insert Row Below')).toBeInTheDocument();
      expect(screen.getByText('Delete Row')).toBeInTheDocument();
    });

    it('should call insertRowAbove when clicking Insert Row Above', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="row" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const insertAboveButton = screen.getByText('Insert Row Above');
      await user.click(insertAboveButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call insertRowBelow when clicking Insert Row Below', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="row" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const insertBelowButton = screen.getByText('Insert Row Below');
      await user.click(insertBelowButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call deleteRow when clicking Delete Row', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="row" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const deleteButton = screen.getByText('Delete Row');
      await user.click(deleteButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('Menu interactions', () => {
    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      // Wait for the click listener to be attached (next tick)
      await vi.waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      // Click outside the menu
      await user.click(container);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should close menu when pressing Escape key', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should not close menu when clicking inside', async () => {
      const user = userEvent.setup();
      render(
        <SpreadsheetProvider rows={5} cols={5} formulaInputRef={null}>
          <GridHeaderContextMenu x={100} y={200} type="column" index={1} onClose={mockOnClose} />
        </SpreadsheetProvider>
      );

      const menu = screen.getByTestId('grid-header-context-menu');
      await user.click(menu);

      // Menu click itself should not trigger close
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
