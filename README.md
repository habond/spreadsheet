# Simple Spreadsheet

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-184%20passing-brightgreen.svg)]()

A fully-featured spreadsheet implementation with a robust evaluation engine, built with TypeScript and React.

## Features

- **20x10 grid** of cells (A-J columns, 1-20 rows)
- **Formula support** with Excel-like syntax
- **Arithmetic operators**: `+`, `-`, `*`, `/` with proper precedence
- **Built-in functions**: `SUM`, `AVERAGE`, `MIN`, `MAX`, `ADD`, `SUB`, `MUL`, `DIV`
- **Dependency tracking** with automatic cascading updates
- **Circular dependency detection** with clear error messages
- **Comprehensive error handling** for all edge cases
- **Keyboard navigation** with arrow keys
- Full **TypeScript type safety**

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
   - Press Enter to commit and move down
   - Press Tab to commit and move right
   - Use arrow keys to navigate between cells

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

### Functions

```
=SUM(A1, B1, C1)           Sum of values
=AVERAGE(A1, B1, C1)       Average of values
=MIN(A1, B1, C1)           Minimum value
=MAX(A1, B1, C1)           Maximum value
=ADD(A1, B1)               Add two values
=SUB(A1, B1)               Subtract two values
=MUL(A1, B1)               Multiply two values
=DIV(A1, B1)               Divide two values
```

### Complex Formulas

```
=SUM(A1, B1) + C1 * 2
=AVERAGE(A1, B1, C1) - MIN(D1, E1)
=ADD(SUM(A1, B1), MUL(C1, 2))
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
│   └── cell-result-store.ts    # Evaluation results
├── ui/                         # React UI layer
│   ├── components/             # React components
│   │   ├── App.tsx, Grid.tsx, Cell.tsx
│   │   ├── FormulaBar.tsx, InfoDisplay.tsx
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

## Keyboard Shortcuts

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

## Future Enhancements

Potential additions to explore:

- **Cell ranges**: `=SUM(A1:A10)`
- **More functions**: `IF`, `VLOOKUP`, `CONCATENATE`
- **String operations**: `CONCAT`, `LEFT`, `RIGHT`, `TRIM`
- **Date/time functions**: `NOW`, `TODAY`, `DATE`
- **Conditional formatting**
- **Cell formatting** (number formats, colors, fonts)
- **Multiple sheets**
- **Undo/redo**
- **Copy/paste**
- **Export to CSV/Excel**

## License

MIT
