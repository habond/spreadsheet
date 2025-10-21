# Simple Spreadsheet

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-184%20passing-brightgreen.svg)]()

A fully-featured spreadsheet implementation with a robust evaluation engine, built with TypeScript and React.

## Features

### Core Functionality

- **20x10 grid** of cells (A-J columns, 1-20 rows)
- **Formula support** with Excel-like syntax
- **Arithmetic operators**: `+`, `-`, `*`, `/` with proper precedence
- **Built-in functions**: `SUM`, `AVERAGE`, `MIN`, `MAX`, `ADD`, `SUB`, `MUL`, `DIV`
- **Dependency tracking** with automatic cascading updates
- **Circular dependency detection** with clear error messages
- **Comprehensive error handling** for all edge cases

### User Interface

- **Function menu** (ƒx button) - Quick access to all supported functions
- **Info popover** (ⓘ button) - View current cell information
- **Resizable columns** - Drag column header edges to resize
- **Resizable rows** - Drag row header edges to resize
- **Keyboard navigation** - Arrow keys, Enter, Tab for efficient editing
- **Auto-save** - Automatic persistence to localStorage
- **Clear button** - Reset all data with confirmation dialog
- **Clean, modern UI** - Streamlined interface with popovers for additional info

### Technical

- Full **TypeScript type safety** with strict mode
- **React 19** with Context API for state management
- **Type-safe function definitions** with centralized metadata
- **184 passing tests** with comprehensive test coverage

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

   This will start the Vite development server (typically at `http://localhost:5173`).

   **Other commands:**
   - `npm run build` - Build for production (TypeScript compilation + Vite build)
   - `npm run preview` - Preview production build
   - `npm test` - Run tests in watch mode
   - `npm run test:run` - Run tests once

3. **Use the spreadsheet:**
   - Cell A1 is automatically selected and the formula bar is focused
   - Type a value or formula in the formula bar
   - Click the **ƒx button** to insert a function from the menu
   - Click the **ⓘ button** to view current cell information
   - Press Enter to commit and move down
   - Press Tab to commit and move right
   - Use arrow keys to navigate between cells
   - **Resize columns**: Hover over column header edge and drag
   - **Resize rows**: Hover over row header edge and drag
   - **Data persistence**: All changes are automatically saved to browser localStorage
   - **Clear data**: Click the red "Clear" button to reset all data (with confirmation)

## Formula Syntax

### Arithmetic Operations

```
=A1 + B1           Addition
=A1 - B1           Subtraction
=A1 * B1           Multiplication
=A1 / B1           Division
=(A1 + B1) * 2     Parentheses for grouping
=A1 + B1 * 2       Respects operator precedence
```

### Comparison Operators

```
=A1 > B1           Greater than (returns 1 if true, 0 if false)
=A1 < B1           Less than
=A1 >= B1          Greater than or equal
=A1 <= B1          Less than or equal
=A1 = B1           Equal (also ==)
=A1 <> B1          Not equal (also !=)
=5 > 3             Direct comparisons (returns 1)
="hello" = "hello" String comparisons (returns 1)
```

### Functions

#### Math Functions

```
=SUM(A1, B1, C1)           Sum of values
=AVERAGE(A1, B1, C1)       Average of values (alias: AVG)
=MIN(A1, B1, C1)           Minimum value
=MAX(A1, B1, C1)           Maximum value
=ADD(A1, B1)               Add two values
=SUB(A1, B1)               Subtract two values
=MUL(A1, B1)               Multiply two values (alias: MULTIPLY)
=DIV(A1, B1)               Divide two values (alias: DIVIDE)
```

#### Logical Functions

```
=IF(A1 > 10, "High", "Low")       Conditional logic with comparison
=IF(A1 = B1, "Equal", "Different") String or number comparison
=IF(A1, B1, C1)                   If A1 is true/non-zero, return B1, else C1
```

#### Count Functions

```
=COUNT(A1, B1, C1, "text")        Count numeric values (returns 3)
```

#### String Functions

```
=CONCATENATE("Hello", " ", "World")   Join text strings (returns "Hello World")
=CONCAT(A1, A2)                       Alias for CONCATENATE
=LEFT("Hello", 3)                     Extract from left (returns "Hel")
=RIGHT("Hello", 2)                    Extract from right (returns "lo")
=TRIM("  text  ")                     Remove leading/trailing spaces (returns "text")
=UPPER("hello")                       Convert to uppercase (returns "HELLO")
=LOWER("HELLO")                       Convert to lowercase (returns "hello")
```

#### Date/Time Functions

```
=NOW()                                Current date and time as timestamp
=TODAY()                              Current date at midnight as timestamp
=DATE(2024, 3, 15)                    Create date from year, month, day
=DATEDIF(start, end, "D")             Calculate difference in Days
=DATEDIF(start, end, "M")             Calculate difference in Months
=DATEDIF(start, end, "Y")             Calculate difference in Years
```

### Complex Formulas

```
=SUM(A1, B1) + C1 * 2
=AVERAGE(A1, B1, C1) - MIN(D1, E1)
=ADD(SUM(A1, B1), MUL(C1, 2))
=IF(A1 > 100, "Large", "Small")
=IF(A1 >= 90, "A", IF(A1 >= 80, "B", "C"))
=CONCATENATE("Total: ", SUM(A1, A2, A3))
=DATEDIF(DATE(2024, 1, 1), DATE(2024, 12, 31), "D")
=UPPER(CONCATENATE(A1, " ", A2))
=IF(LEFT(A1, 3) = "ABC", "Match", "No match")
```

## Architecture

The spreadsheet is built with a clean, layered architecture:

```
src/
├── core/                       # Business logic (framework-agnostic)
│   ├── evaluation/             # Formula engine
│   │   ├── formula-parser.ts   - Tokenization & cell references
│   │   ├── formula-calculator.ts - Expression evaluation
│   │   └── dependency-graph.ts - Dependency tracking & cycle detection
│   ├── eval-engine.ts          # Main orchestrator
│   └── types.ts                # Type definitions
├── data/                       # Data storage
│   ├── spreadsheet.ts          # Cell data & navigation
│   ├── cell-result-store.ts    # Evaluation results
│   └── local-storage.ts        # Browser localStorage persistence
├── ui/                         # React UI layer
│   ├── components/             # React components
│   │   ├── App.tsx             - Main app layout
│   │   ├── Grid.tsx            - Spreadsheet grid with resize logic
│   │   ├── Cell.tsx            - Individual cell component
│   │   ├── FormulaBar.tsx      - Formula input with function menu
│   │   ├── FunctionMenu.tsx    - Dropdown menu of functions
│   │   ├── InfoButton.tsx      - Info popover button
│   │   └── InfoDisplay.tsx     - Cell information display
│   ├── hooks/                  # Custom hooks
│   │   └── useKeyboardNavigation.tsx
│   └── SpreadsheetContext.tsx  # React Context for state
└── main.tsx                    # React entry point
```

**Key Features:**

- **Dependency Tracking**: Automatically updates dependent cells
- **Cycle Detection**: Prevents infinite loops with clear error messages
- **Operator Precedence**: Correctly evaluates `2 + 3 * 4` as `14`
- **Modular Design**: Clean separation between data, logic, and UI
- **React UI**: Declarative components with Context API for state management
- **Framework-Agnostic Core**: Business logic can be reused with any UI framework

## How It Works

When you type a formula:

1. **Parse**: Formula is tokenized into components
2. **Evaluate**: Recursive descent parser evaluates with correct precedence
3. **Track**: Dependencies between cells are tracked
4. **Update**: Dependent cells automatically recalculate in topological order
5. **Display**: UI updates with new values

## Example Usage

### Basic Values

```
A1: 5          → displays 5
A2: 10         → displays 10
A3: Hello      → displays Hello
```

### Simple Formulas

```
A1: 5
A2: 10
A3: =A1 + A2   → displays 15
```

### Cascading Updates

```
A1: 5
A2: 10
A3: =A1 + A2   → displays 15

(Change A1 to 20)
A1: 20
A3: =A1 + A2   → automatically updates to 30
```

### Complex Dependencies

```
A1: 5
A2: 10
A3: =A1 + A2        → displays 15
A4: =A3 * 2         → displays 30
A5: =SUM(A3, A4)    → displays 45

(Change A1 to 10)
A1: 10
A3: =A1 + A2        → automatically updates to 20
A4: =A3 * 2         → automatically updates to 40
A5: =SUM(A3, A4)    → automatically updates to 60
```

### Circular Dependency Detection

```
A1: =A2
A2: =A1         → displays error: "Circular dependency: A2 -> A1 -> A2"
```

## Error Handling

The spreadsheet provides clear error messages:

- **Division by zero**: `"Division by zero"`
- **Missing cell value**: `"Cell A1 has no value"`
- **Circular dependency**: `"Circular dependency: A1 -> A2 -> A1"`
- **Invalid function**: `"Unknown function: FOO"`
- **Syntax errors**: `"Unexpected character: @"`
- **Type errors**: `"Cannot convert 'abc' to number"`

## User Interface

### Formula Bar

- **Function Menu (ƒx)**: Click to see all supported functions and insert them into formulas
- **Info Button (ⓘ)**: Click to view current cell information in a popover
- **Clear Button**: Red button to reset all spreadsheet data (with confirmation dialog)
- **Formula Input**: Type values or formulas directly, with autocomplete disabled for better control

### Grid Interaction

- **Column Resize**: Hover over the right edge of any column header until the cursor changes to `↔`, then click and drag
- **Row Resize**: Hover over the bottom edge of any row header until the cursor changes to `↕`, then click and drag
- **Minimum Size**: Columns and rows enforce a minimum size of 20px

### Keyboard Shortcuts

- **Enter** - Commit value and move down
- **Tab** - Commit value and move right
- **Shift+Tab** - Commit value and move left
- **Arrow Keys** - Navigate between cells

## Development

**React DevTools:**
Install the [React DevTools](https://react.dev/learn/react-developer-tools) browser extension to:

- Inspect component hierarchy
- View component props and state
- Monitor SpreadsheetContext state
- Profile component re-renders

## Data Persistence

The spreadsheet automatically saves all data to browser localStorage:

- **Auto-save**: Every change (cell edits, column/row resizing) is automatically saved
- **Auto-restore**: Data persists across browser refreshes and sessions
- **Clear data**: Click the red "Clear" button to reset all data
- **Storage key**: `spreadsheet-state` in localStorage
- **Stored data**: Cell contents, column widths, row heights, and selected cell

**Note**: Data is stored in your browser's localStorage and is specific to this domain. Clearing browser data will remove the saved spreadsheet.

## Future Enhancements

Potential additions to explore:

- **Cell ranges**: `=SUM(A1:A10)` for range operations
- **Range-based functions**: `VLOOKUP`, `COUNTIF`, `SUMIF` (requires range support)
- **Conditional formatting**: Color cells based on values
- **Cell formatting**: Number formats, colors, fonts, alignment
- **Multiple sheets**: Tabs for different worksheets
- **Undo/redo**: History management for changes
- **Copy/paste**: Cell and formula copying
- **Export to CSV/Excel**: Download spreadsheet data
- **Import from CSV/Excel**: Load external spreadsheet data
- **Column/row insertion/deletion**: Dynamic grid sizing
- **Freeze panes**: Lock headers while scrolling

## License

MIT
