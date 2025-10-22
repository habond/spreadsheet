# Simple Spreadsheet

[![CI](https://github.com/habond/spreadsheet/workflows/CI/badge.svg)](https://github.com/habond/spreadsheet/actions)
[![Tests](https://img.shields.io/badge/tests-804%20passing-brightgreen.svg)](https://github.com/habond/spreadsheet/actions)
[![Coverage](https://img.shields.io/badge/coverage-90.51%25-brightgreen.svg)](https://github.com/habond/spreadsheet/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fully-featured spreadsheet implementation with a robust evaluation engine, built with TypeScript and React.

## Features

### Core Functionality

- **20x10 grid** of cells (A-J columns, 1-20 rows)
- **Formula support** with Excel-like syntax
- **Arithmetic operators**: `+`, `-`, `*`, `/` with proper precedence
- **Comparison operators**: `>`, `<`, `>=`, `<=`, `=`, `<>`
- **Built-in functions**: Math (`SUM`, `AVERAGE`, `MIN`, `MAX`), Logic (`IF`), Count (`COUNT`, `COUNTIF`), Conditional (`SUMIF`, `SUMIFS`), Lookup (`VLOOKUP`), String (`CONCATENATE`, `LEFT`, `RIGHT`, `TRIM`, `UPPER`, `LOWER`), Date/Time (`NOW`, `TODAY`, `DATE`, `DATEDIF`)
- **Range expressions**: `A1:B10` for operating on multiple cells at once
- **Dependency tracking** with automatic cascading updates
- **Circular dependency detection** with clear error messages
- **Comprehensive error handling** for all edge cases
- **Cell formatting**: Number (1,234.56), Currency ($1,234.56), Percentage (75.00%), Date, Time, Boolean (1→True, 0→False)

### User Interface

- **Function menu** (ƒx button) - Quick access to all supported functions
- **Info popover** (ⓘ button) - View current cell information
- **Resizable columns** - Drag column header edges to resize
- **Resizable rows** - Drag row header edges to resize
- **Keyboard navigation** - Arrow keys, Enter, Tab for efficient editing
- **Auto-save** - Automatic debounced persistence to localStorage
- **Clear button** - Reset all data with confirmation dialog
- **Clean, modern UI** - Streamlined interface with popovers for additional info
- **Error boundary** - Graceful error handling with recovery options

### Technical

- Full **TypeScript type safety** with strict mode
- **React 19** with Context API for state management
- **Type-safe function definitions** with centralized metadata
- **Performance optimized** with:
  - **Granular re-rendering**: Pub-sub architecture using `useSyncExternalStore` ensures only affected cells re-render
  - **Zero over-rendering**: Column/row resizing doesn't trigger cell re-renders
  - **Efficient subscriptions**: Each cell subscribes only to its own data changes
  - **Memoization**: Context values and expensive calculations are memoized
  - **Debouncing**: LocalStorage writes are debounced to reduce I/O
- **ESLint** with React and React Hooks rules
- **Comprehensive test coverage** with Vitest + React Testing Library (804 tests including 12 render optimization tests)

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
   - Cell A1 is automatically selected
   - **Editing**: Click a cell or start typing to edit in the formula bar
   - **Double-click**: Double-click a cell to focus the formula bar for editing
   - **Function menu**: Click the **ƒx button** to insert a function from the dropdown menu
   - **Cell formatting**: Use the format dropdown to style cell values:
     - **Raw**: Display values as-is (default)
     - **Number**: Thousands separator with 2 decimals (1,234.56)
     - **Currency**: Dollar format with symbol ($1,234.56)
     - **Percentage**: Multiply by 100 and add % (0.75 → 75.00%)
     - **Date**: Format timestamps as localized date
     - **Time**: Format timestamps as localized time
     - **Boolean**: Display 1 as "True", 0 as "False"
   - **Cell info**: Click the **ⓘ button** to view current cell details (raw value, display value, errors)
   - **Keyboard navigation**:
     - **Arrow keys**: Navigate between cells (works anytime, even while editing)
     - **Enter**: Save value and move down (Shift+Enter moves up)
     - **Tab**: Save value and move right (Shift+Tab moves left)
     - **Delete/Backspace**: Clear cell contents (when cell is focused but formula bar is not)
   - **Resizing**: Hover over column/row header edges and drag to resize
   - **Persistence**: All changes auto-save to browser localStorage
   - **Clear data**: Click the red "Clear" button to reset all data (requires confirmation)

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
=SUM(A1:A10)               Sum of range (all cells from A1 to A10)
=SUM(A1:B3, C1)            Sum of range plus individual cell
=AVERAGE(A1, B1, C1)       Average of values (alias: AVG)
=AVERAGE(A1:A10)           Average of range
=MIN(A1, B1, C1)           Minimum value
=MIN(A1:B10)               Minimum value in range
=MAX(A1, B1, C1)           Maximum value
=MAX(A1:B10)               Maximum value in range
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
=COUNT(A1:A10)                     Count numeric values in range
=COUNTIF(A1:A10, ">5")            Count cells in range where value > 5
=COUNTIF(A1:A10, "apple")         Count cells in range that equal "apple"
=COUNTIF(A1:A10, "=20")           Count cells in range that equal 20
=COUNTIF(A1:A10, "<>0")           Count cells in range that are not equal to 0
```

#### Conditional Sum Functions

```
=SUMIF(A1:A10, ">5")              Sum cells in range where value > 5
=SUMIF(A1:A10, "apple", B1:B10)   Sum B1:B10 where corresponding A1:A10 = "apple"
=SUMIF(A1:A10, ">=10")            Sum cells in range where value >= 10
=SUMIFS(C1:C10, A1:A10, ">5", B1:B10, "apple")  Sum C1:C10 where A1:A10 > 5 AND B1:B10 = "apple"
=SUMIFS(D1:D10, A1:A10, ">=10", B1:B10, "<>0", C1:C10, "active")  Multiple criteria (AND logic)
```

#### Lookup Functions

```
=VLOOKUP("Product A", A1:C10, 2, 0)       Look up "Product A" in column A, return value from column B (exact match)
=VLOOKUP("Product A", A1:C10, 3)          Same as above, return value from column C (exact match is default)
=VLOOKUP(100, A1:D20, 4, 0)               Look up 100 in first column, return value from 4th column (exact match)
=VLOOKUP(85, A1:B10, 2, 1)                Look up 85 in first column, return value from column B (approximate match)
=VLOOKUP("E001", A1:D50, 2)               Employee lookup: find "E001" in column A, return name from column B
```

**Parameters:**
- `lookup_value`: The value to search for in the first column
- `table_range`: The 2D range to search (must be a range, not individual cells)
- `col_index_num`: Column number (1-based) to return the value from
- `range_lookup`: Optional. 0 or FALSE for exact match (default), 1 or TRUE for approximate match

**Notes:**
- Exact match (default): Searches for exact value, case-insensitive for text
- Approximate match: Finds largest value ≤ lookup_value (assumes sorted data)
- Returns error if no match found or if result cell is empty

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

### Range Syntax

Cell ranges allow you to operate on multiple cells at once:

```
=SUM(A1:A10)                       Sum cells A1 through A10
=AVERAGE(B1:B5)                    Average cells B1 through B5
=MAX(A1:C3)                        Maximum value in 2D range (A1, A2, A3, B1, B2, B3, C1, C2, C3)
=SUM(A1:A5, B1:B5)                 Sum multiple ranges
=AVERAGE(A1:A10, C1)               Mix ranges and individual cells
=MIN(A1:J20)                       Works with any valid range
```

**Note**: Ranges can only be used as function arguments. You cannot use ranges directly in arithmetic expressions (e.g., `=A1:A3 + 5` is invalid, but `=SUM(A1:A3) + 5` is valid).

### Complex Formulas

```
=SUM(A1:A10) + C1 * 2
=AVERAGE(A1:B5) - MIN(D1:D10)
=SUM(A1:A5, B1:B5) / 2
=IF(SUM(A1:A10) > 100, "Large", "Small")
=IF(A1 >= 90, "A", IF(A1 >= 80, "B", "C"))
=CONCATENATE("Total: ", SUM(A1:A5))
=DATEDIF(DATE(2024, 1, 1), DATE(2024, 12, 31), "D")
=UPPER(CONCATENATE(A1, " ", A2))
=IF(LEFT(A1, 3) = "ABC", "Match", "No match")
=MAX(A1:A10, B1:B10, 100)
```

## Architecture

The spreadsheet is built with a clean, layered architecture:

```
src/
├── types/                      # Type definitions (no index.ts)
│   ├── core.ts                 - Core types (CellID, EvalResult, FunctionInfo, CellFormat)
│   └── ast.ts                  - AST node types & type guards
├── errors/                     # Custom error classes (one per file)
│   ├── CircularDependencyError.ts
│   ├── FormulaParseError.ts
│   ├── CellReferenceError.ts
│   ├── DivisionByZeroError.ts
│   ├── FunctionArgumentError.ts
│   └── InvalidFunctionError.ts
├── constants/                  # Application constants
│   └── app-constants.ts        - Sizing and default values
├── parser/                     # Formula parsing (pure, stateless)
│   ├── tokenizer.ts            - Lexical analysis
│   ├── ast-parser.ts           - Builds AST from tokens
│   ├── formula-parser.ts       - parse(), extractCellReferences()
│   └── helpers.ts              - Range expansion utilities
├── evaluator/                  # Formula evaluation (stateless)
│   ├── formula-evaluator.ts    - Evaluates AST nodes
│   └── functions/              # Function implementations (one per file)
│       ├── sum.ts, average.ts, min.ts, max.ts, count.ts
│       ├── add.ts, sub.ts, mul.ts, div.ts
│       ├── if.ts               - Logic functions
│       ├── countif.ts, sumif.ts, sumifs.ts - Conditional functions
│       ├── concatenate.ts, left.ts, right.ts, trim.ts, upper.ts, lower.ts
│       ├── now.ts, today.ts, date.ts, datedif.ts
│       ├── helpers.ts          - Validation & conversion utilities
│       └── function-registry.ts - Function registry, metadata, executor
├── engine/                     # Evaluation orchestration
│   ├── dependency-graph.ts     - Tracks cell dependencies
│   └── eval-engine.ts          - Main orchestrator
├── utils/                      # Pure utility functions
│   └── column-utils.ts         - Column letter/number conversion
├── formatter/                  # Cell formatting (one per format type)
│   ├── helpers.ts              - Shared formatting utilities
│   ├── format-raw.ts           - Raw format (no formatting)
│   ├── format-number.ts        - Number format (1,234.56)
│   ├── format-currency.ts      - Currency format ($1,234.56)
│   ├── format-percentage.ts    - Percentage format (75.00%)
│   ├── format-date.ts          - Date format
│   ├── format-time.ts          - Time format
│   ├── format-boolean.ts       - Boolean format (True/False)
│   └── cell-formatter.ts       - Main formatter orchestrator
├── model/                      # Data model layer
│   ├── spreadsheet.ts          - Cell storage & navigation
│   ├── cell-result-store.ts    - Evaluation cache
│   └── local-storage.ts        - Browser persistence
├── ui/                         # React UI layer
│   ├── components/             # React components
│   │   ├── App.tsx             - Main app layout with ErrorBoundary
│   │   ├── Grid.tsx            - Spreadsheet grid with resize logic
│   │   ├── Cell.tsx            - Individual cell component
│   │   ├── FormulaBar.tsx      - Formula input with function & format menu
│   │   ├── FunctionMenu.tsx    - Dropdown menu of functions
│   │   ├── InfoButton.tsx      - Info popover with cell display
│   │   └── ErrorBoundary.tsx   - Error handling component
│   ├── contexts/               # React contexts
│   │   └── SpreadsheetContext.tsx - Main spreadsheet state
│   └── hooks/                  # Custom hooks
│       ├── useKeyboardNavigation.tsx
│       ├── useClickOutside.tsx - Click-outside detection
│       └── useDebounce.tsx     - Debounce hook
└── main.tsx                    # React entry point
```

**Key Features:**

- **AST-Based Evaluation**: Formulas are parsed into Abstract Syntax Trees for clean separation of concerns
- **Dependency Tracking**: Automatically updates dependent cells
- **Cycle Detection**: Prevents infinite loops with clear error messages
- **Operator Precedence**: Correctly evaluates `2 + 3 * 4` as `14`
- **Modular Design**: Clean separation between data, logic, and UI
- **React UI**: Declarative components with Context API for state management
- **Framework-Agnostic Core**: Business logic can be reused with any UI framework

## How It Works

When you type a formula:

1. **Tokenize**: Formula is broken into tokens (numbers, operators, functions, cell refs)
2. **Parse**: Tokens are converted into an Abstract Syntax Tree (AST)
3. **Evaluate**: AST is recursively evaluated with correct precedence
4. **Track**: Dependencies between cells are tracked
5. **Update**: Dependent cells automatically recalculate in topological order
6. **Display**: UI updates with new values

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

### Range Examples

```
A1: 10
A2: 20
A3: 30
B1: =SUM(A1:A3)     → displays 60

(Change A2 to 50)
A2: 50
B1: =SUM(A1:A3)     → automatically updates to 90
```

```
A1: 5, A2: 10, A3: 15
B1: 2, B2: 4,  B3: 6

C1: =AVERAGE(A1:B3)  → displays 7 (average of all 6 values)
C2: =MAX(A1:A3)      → displays 15
C3: =MIN(B1:B3)      → displays 2
C4: =COUNT(A1:B3)    → displays 6
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

### Cell Formatting Examples

```
A1: 1234567.89
(Set format to Number)     → displays 1,234,567.89
(Set format to Currency)   → displays $1,234,567.89

A2: 0.75
(Set format to Percentage) → displays 75.00%

A3: =NOW()
(Set format to Date)       → displays localized date (e.g., 01/01/2024)
(Set format to Time)       → displays localized time (e.g., 2:30:45 PM)

A4: =DATE(2024, 3, 15)
(Set format to Date)       → displays 03/15/2024

A5: =5 > 3
(Set format to Boolean)    → displays True

A6: =TODAY()
(Set format to Date)       → displays current date in localized format
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
- **Invalid range**: `"Invalid range: start must be before end in B2:A1"`
- **Range misuse**: `"Ranges cannot be used directly in expressions or comparisons"`

## User Interface

### Formula Bar

- **Function Menu (ƒx)**: Click to see all supported functions and insert them into formulas
- **Format Dropdown**: Select cell format with grouped options
  - **Raw**: Display values as-is (default)
  - **Number**: Thousands separator with 2 decimals (1,234.56)
  - **Currency**: Dollar format with symbol ($1,234.56)
  - **Percentage**: Multiply by 100 and add % (0.75 → 75.00%)
  - **Date**: Format timestamps using browser locale
  - **Time**: Format timestamps as time using browser locale
  - **Boolean**: Display 1 as "True", 0 as "False"
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

- **Additional range-based functions**: `HLOOKUP`, `INDEX`, `MATCH`
- **Conditional formatting**: Color cells based on values
- **Advanced cell formatting**: Colors, fonts, alignment, custom number formats
- **Multiple sheets**: Tabs for different worksheets
- **Undo/redo**: History management for changes
- **Copy/paste**: Cell and formula copying
- **Export to CSV/Excel**: Download spreadsheet data
- **Import from CSV/Excel**: Load external spreadsheet data
- **Column/row insertion/deletion**: Dynamic grid sizing
- **Freeze panes**: Lock headers while scrolling
- **Charts and graphs**: Visualize data with charts

## License

MIT
