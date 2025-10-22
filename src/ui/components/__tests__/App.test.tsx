import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

describe('App', () => {
  beforeEach(() => {
    // Mock localStorage for SpreadsheetContext
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('should render the app container', () => {
    render(<App />);

    const container = document.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('should render FormulaBar component', () => {
    render(<App />);

    // FormulaBar has a formula input
    const formulaInput = screen.getByPlaceholderText(/Enter value or formula/i);
    expect(formulaInput).toBeInTheDocument();
  });

  it('should render Grid component', () => {
    render(<App />);

    // Grid should have cells
    const cells = screen.getAllByTestId(/^cell-/);
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should render both FormulaBar and Grid together', () => {
    render(<App />);

    const formulaInput = screen.getByPlaceholderText(/Enter value or formula/i);
    const cells = screen.getAllByTestId(/^cell-/);

    expect(formulaInput).toBeInTheDocument();
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should initialize with default 20x10 grid', () => {
    render(<App />);

    // Check for column headers (A through J = 10 columns)
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();

    // Check for row numbers (1 through 20)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should wrap components in ErrorBoundary', () => {
    // If we render without errors, ErrorBoundary should not show error UI
    render(<App />);

    // Should not show error UI
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();

    // Should show normal content
    expect(screen.getByPlaceholderText(/Enter value or formula/i)).toBeInTheDocument();
  });

  it('should provide SpreadsheetContext to child components', () => {
    render(<App />);

    // The Grid and FormulaBar should render, which confirms context is working
    // If context wasn't provided, these would throw errors
    const formulaInput = screen.getByPlaceholderText(/Enter value or formula/i);
    const cells = screen.getAllByTestId(/^cell-/);

    expect(formulaInput).toBeInTheDocument();
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should have proper component hierarchy', () => {
    const { container } = render(<App />);

    // ErrorBoundary wraps everything
    // SpreadsheetProvider is inside ErrorBoundary
    // SpreadsheetApp is inside SpreadsheetProvider
    // container > FormulaBar + Grid are inside SpreadsheetApp

    const appContainer = container.querySelector('.container');
    expect(appContainer).not.toBeNull();

    // FormulaBar and Grid should be children of container
    const spreadsheetContainer = container.querySelector('.spreadsheet-container');
    expect(spreadsheetContainer).not.toBeNull();
  });

  it('should render function menu button', () => {
    render(<App />);

    // FunctionMenu is part of FormulaBar
    const functionButton = screen.getByRole('button', { name: /ƒx/i });
    expect(functionButton).toBeInTheDocument();
  });

  it('should render toolbar with title', () => {
    render(<App />);

    // Toolbar should contain the app title
    const title = screen.getByRole('heading', { name: /spreadsheet/i });
    expect(title).toBeInTheDocument();
  });

  it('should render clear spreadsheet button', () => {
    render(<App />);

    // Clear Spreadsheet button is in toolbar
    const clearButton = screen.getByRole('button', { name: /clear spreadsheet/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    render(<App />);

    // Should have input elements
    const formulaInput = screen.getByPlaceholderText(/Enter value or formula/i);
    expect(formulaInput).toBeInTheDocument();

    // Should have buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
