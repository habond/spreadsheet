import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { Cell } from '../Cell';
import { SpreadsheetProvider } from '../../SpreadsheetContext';

describe('Cell', () => {
  const defaultProps = {
    cellId: 'A1',
    row: 0,
    col: 0,
  };

  const renderCell = (props = defaultProps) => {
    return render(
      <SpreadsheetProvider>
        <Cell {...props} />
      </SpreadsheetProvider>
    );
  };

  it('should render cell with correct attributes', () => {
    renderCell();

    const cell = screen.getByTestId('cell-A1');
    expect(cell).toHaveAttribute('data-cell-id', 'A1');
    expect(cell).toHaveAttribute('data-row', '0');
    expect(cell).toHaveAttribute('data-col', '0');
  });

  it('should apply selected class when cell is selected', () => {
    renderCell();

    const cell = screen.getByTestId('cell-A1');
    // A1 is auto-selected on mount
    expect(cell).toHaveClass('selected');
  });

  it('should call selectCell when clicked', async () => {
    const user = userEvent.setup();
    renderCell({ cellId: 'B2', row: 1, col: 1 });

    const cell = screen.getByTestId('cell-B2');
    await user.click(cell);

    // After click, B2 should be selected
    expect(cell).toHaveClass('selected');
  });

  it('should display cell content', () => {
    renderCell();
    const cell = screen.getByTestId('cell-A1');
    expect(cell).toBeInTheDocument();
  });
});
