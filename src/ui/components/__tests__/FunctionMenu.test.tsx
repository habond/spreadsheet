import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { FunctionMenu } from '../FunctionMenu';

describe('FunctionMenu', () => {
  it('should render the function menu button', () => {
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    const button = screen.getByTitle(/insert function/i);
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('ƒx');
  });

  it('should not show dropdown menu initially', () => {
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    // Dropdown should not be visible
    expect(screen.queryByRole('button', { name: /SUM/i })).not.toBeInTheDocument();
  });

  it('should show dropdown menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);

    // Dropdown should now be visible with function options
    expect(screen.getByRole('button', { name: /SUM/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AVERAGE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MIN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MAX/i })).toBeInTheDocument();
  });

  it('should hide dropdown menu when button is clicked again', async () => {
    const user = userEvent.setup();
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    const menuButton = screen.getByTitle(/insert function/i);

    // Open menu
    await user.click(menuButton);
    expect(screen.getByRole('button', { name: /SUM/i })).toBeInTheDocument();

    // Close menu
    await user.click(menuButton);
    expect(screen.queryByRole('button', { name: /SUM/i })).not.toBeInTheDocument();
  });

  it('should call onFunctionSelect when a function is clicked', async () => {
    const user = userEvent.setup();
    const onFunctionSelect = vi.fn();
    render(<FunctionMenu onFunctionSelect={onFunctionSelect} />);

    // Open menu
    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);

    // Click SUM function
    const sumButton = screen.getByRole('button', { name: /SUM/i });
    await user.click(sumButton);

    expect(onFunctionSelect).toHaveBeenCalledWith('SUM');
    expect(onFunctionSelect).toHaveBeenCalledTimes(1);
  });

  it('should close dropdown after selecting a function', async () => {
    const user = userEvent.setup();
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    // Open menu
    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);

    // Click a function
    const avgButton = screen.getByRole('button', { name: /AVERAGE/i });
    await user.click(avgButton);

    // Menu should be closed
    expect(screen.queryByRole('button', { name: /SUM/i })).not.toBeInTheDocument();
  });

  it('should display function descriptions', async () => {
    const user = userEvent.setup();
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);

    // Check that descriptions are present - they're in separate span elements
    expect(
      screen.getByText('Add all arguments', { selector: '.function-description' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Calculate average of arguments', { selector: '.function-description' })
    ).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FunctionMenu onFunctionSelect={vi.fn()} />
        <button>Outside button</button>
      </div>
    );

    // Open menu
    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);
    expect(screen.getByRole('button', { name: /SUM/i })).toBeInTheDocument();

    // Click outside
    const outsideButton = screen.getByRole('button', { name: /outside button/i });
    await user.click(outsideButton);

    // Menu should be closed
    expect(screen.queryByRole('button', { name: /SUM/i })).not.toBeInTheDocument();
  });

  it('should render all supported functions', async () => {
    const user = userEvent.setup();
    render(<FunctionMenu onFunctionSelect={vi.fn()} />);

    const menuButton = screen.getByTitle(/insert function/i);
    await user.click(menuButton);

    // Check for various functions using function-name class for more precise matching
    expect(screen.getByText('SUM', { selector: '.function-name' })).toBeInTheDocument();
    expect(screen.getByText('AVERAGE', { selector: '.function-name' })).toBeInTheDocument();
    expect(screen.getByText('COUNT', { selector: '.function-name' })).toBeInTheDocument();
    expect(screen.getByText('IF', { selector: '.function-name' })).toBeInTheDocument();
    expect(screen.getByText('CONCATENATE', { selector: '.function-name' })).toBeInTheDocument();
    expect(screen.getByText('NOW', { selector: '.function-name' })).toBeInTheDocument();
  });
});
