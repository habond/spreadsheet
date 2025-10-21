# Claude Context

Quick reference for AI assistants working on this codebase.

## Project Overview

A TypeScript spreadsheet with formula evaluation, dependency tracking, and cycle detection.

**Tech Stack**: TypeScript, React, Vite
**Build**: `npm run build` (tsc + vite)
**Dev**: `npm run dev` (Vite dev server, typically http://localhost:5173)

## Directory Structure

```
src/
├── core/                    # Business logic
│   ├── evaluation/          # Formula engine
│   │   ├── formula-parser.ts
│   │   ├── formula-calculator.ts
│   │   └── dependency-graph.ts
│   ├── eval-engine.ts       # Main orchestrator
│   ├── errors.ts            # Custom error types
│   └── types.ts             # Shared types
├── data/                    # Data layer
│   ├── spreadsheet.ts       # Cell storage with sizing constants
│   ├── cell-result-store.ts # Evaluation cache with JSDoc
│   ├── cell-formatter.ts    # Cell formatting utilities
│   └── local-storage.ts     # LocalStorage persistence
├── ui/                      # React UI layer
│   ├── components/          # React components
│   │   ├── App.tsx          # Main app layout with ErrorBoundary
│   │   ├── Grid.tsx         # Spreadsheet grid with memoized calculations
│   │   ├── Cell.tsx         # Individual cell
│   │   ├── FormulaBar.tsx   # Formula input with function & format menus
│   │   ├── FunctionMenu.tsx # Function dropdown with useClickOutside
│   │   ├── InfoButton.tsx   # Info popover with useClickOutside
│   │   ├── InfoDisplay.tsx  # Cell info display
│   │   └── ErrorBoundary.tsx # Error handling component
│   ├── hooks/               # Custom hooks
│   │   ├── useKeyboardNavigation.tsx
│   │   ├── useClickOutside.tsx  # Reusable click-outside handler
│   │   └── useDebounce.tsx      # Debounce hook for performance
│   └── SpreadsheetContext.tsx # React context with memoization
└── main.tsx                 # React entry point
```

## Key Concepts

### Data Flow

```
User Input → FormulaBar → SpreadsheetContext → Spreadsheet (raw) → EvalEngine → CellResultStore → React Re-render
                                    ↓
                              localStorage (debounced auto-save)
```

### Architecture Layers

- **Data**: Pure storage (Spreadsheet with sizing constants, CellResultStore, localStorage)
- **Core**: Business logic (EvalEngine, parsers, evaluators, custom errors, function metadata)
- **UI**: React components (App with ErrorBoundary, Grid with memoization, Cell, FormulaBar, FunctionMenu, InfoButton)
- **Hooks**: Reusable custom hooks (useKeyboardNavigation, useClickOutside, useDebounce)
- **State**: React Context (SpreadsheetContext with memoized values and debounced persistence)
- **Entry**: main.tsx initialization

### Formula Evaluation

1. **Parse**: Tokenize formula string
2. **Evaluate**: Recursive descent parser with operator precedence
3. **Dependencies**: Track cell references, detect cycles
4. **Update**: Topological sort for correct evaluation order

## Code Conventions

### Import Paths

- Use relative paths with layers: `../core/types`, `../data/spreadsheet`
- React components use `.tsx` extension
- No need for `.js` extensions in imports (Vite handles this)

### TypeScript

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- All types in `core/types.ts`
- Add JSDoc comments for public APIs

### React Best Practices

- Use `useMemo` for expensive calculations
- Use `useCallback` for callbacks passed to child components
- Memoize context values to prevent unnecessary re-renders
- Use custom hooks for reusable logic (useClickOutside, useDebounce)
- Always include proper dependency arrays in useEffect
- Run ESLint before committing (catches React Hooks issues)

### Performance Optimization

- Debounce expensive operations (localStorage writes, API calls)
- Memoize computed styles and arrays in components
- Use React.memo for components that render frequently
- Avoid creating objects/arrays in render (causes unnecessary re-renders)
- Extract constants outside components when possible

### Encapsulation

- Private properties with `private` keyword
- Public readonly properties where appropriate
- Controlled access via methods

### File Organization

- One component/class per file
- React components in `ui/components/`
- Custom hooks in `ui/hooks/`
- Grouped by architectural layer
- Max ~250 lines per file

## Common Tasks

### Add a New Function

1. Add function metadata to `SUPPORTED_FUNCTIONS` array in `formula-calculator.ts`
2. Add constant to `FunctionName` object for type safety
3. Add case to `executeFunction()` switch statement
4. Write tests in `formula-calculator.test.ts`
5. Update README.md formula list

**Important**: Function definitions are centralized in `formula-calculator.ts`. The `SUPPORTED_FUNCTIONS` array is the single source of truth for UI and validation.

### Add a New Component

1. Create `.tsx` file in `ui/components/`
2. Use `useSpreadsheet()` hook to access state
3. Export as named or default export
4. Add `data-testid` attributes for testing
5. Write component tests in `__tests__/ComponentName.test.tsx`
6. Follow existing patterns for consistency

### Add a New Module

1. Place in appropriate layer (`core/`, `data/`, or `ui/`)
2. Import types from `core/types.ts`
3. Maintain separation of concerns

### Refactor Imports

- Search project: `grep -r "from './old-path'" src/`
- Update all occurrences
- Verify: `npm run build`

## Testing

### Running Tests

```bash
npm test               # Run tests in watch mode
npm run test:run       # Run tests once
npm run test:ui        # Run tests with UI
npm run test:coverage  # Generate coverage report
```

**Test Organization:**

- Unit tests: `src/**/__tests__/**/*.test.ts`
- Component tests: `src/ui/components/__tests__/**/*.test.tsx`
- Hook tests: `src/ui/hooks/__tests__/**/*.test.tsx`
- Current test count: **295 tests** (280 core/data + 15 UI/hooks)

**Testing Tools:**

- **Vitest**: Fast unit test framework with jsdom environment
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

### Local Development

```bash
npm run build          # TypeScript + Vite build
npm run dev            # Development server
npm run lint           # ESLint check
npm run format         # Prettier format
```

**React DevTools:**

- Install React DevTools browser extension
- Inspect component tree and props
- View SpreadsheetContext state
- Profile component re-renders

## Important Files

- **tsconfig.json** - TypeScript config (strict mode, unused checks)
- **package.json** - Scripts and dependencies
- **eslint.config.js** - ESLint config with React + React Hooks rules
- **vitest.config.ts** - Test configuration (Vitest)
- **vite.config.ts** - Vite build configuration
- **index.html** - DOM structure (Vite standard: root directory)
- **public/styles.css** - Global styles including error boundary styling

## Known Patterns

### React Context Pattern

Components access shared state via context:

```typescript
const { spreadsheet, evalEngine, selectCell, updateCell } = useSpreadsheet();
```

### Custom Hooks

Encapsulate reusable logic:

```typescript
// Keyboard navigation
function useKeyboardNavigation(inputRef: RefObject<HTMLInputElement | null>) {
  // Hook implementation
}

// Click outside detection
function useClickOutside(ref: RefObject<HTMLElement | null>, callback: () => void) {
  // Hook implementation
}

// Debouncing values
function useDebounce<T>(value: T, delay: number): T {
  // Hook implementation
}
```

### Dependency Injection

EvalEngine uses callbacks for data access:

```typescript
new EvalEngine(
  getCellValue: (cellId) => string,
  getCellResult: (cellId) => EvalResult,
  setCellResult: (cellId, result) => void
)
```

### Component Memoization

Prevent unnecessary re-renders using React.memo and useMemo:

```typescript
// Component memoization
export const Cell = memo(function Cell({ cellId, row, col }: CellProps) {
  // Component implementation
});

// Value memoization
const gridStyle = useMemo(
  () => ({
    gridTemplateColumns: columnWidths.map(w => `${w}px`).join(' '),
    gridTemplateRows: rowHeights.map(h => `${h}px`).join(' '),
  }),
  [columnWidths, rowHeights]
);

// Context value memoization
const contextValue = useMemo(
  () => ({ spreadsheet, evalEngine, selectCell, updateCell }),
  [spreadsheet, evalEngine, selectCell, updateCell]
);
```

### Observer Pattern

Cell changes trigger cascading updates via dependency graph and React re-renders.

### Resize Handling

Column and row resizing is managed through:

1. **Spreadsheet class**: Stores column widths and row heights in Maps with constants:
   - `DEFAULT_COLUMN_WIDTH = 100`
   - `DEFAULT_ROW_HEIGHT = 32`
   - `MIN_COLUMN_WIDTH = 20`
   - `MIN_ROW_HEIGHT = 20`
2. **Context methods**: `setColumnWidth()` and `setRowHeight()` trigger re-renders
3. **Grid component**: Manages drag state and applies memoized dynamic grid-template styles
4. **CSS handles**: 8px wide/tall handles on header edges with hover effects

### Data Persistence

LocalStorage integration for automatic state persistence:

1. **Debounced auto-save**: Uses `useDebounce` hook with 500ms delay to prevent excessive writes
2. **Auto-restore**: On mount, loads saved state and re-evaluates all formulas
3. **State serialization**: `exportState()` and `importState()` methods in Spreadsheet class
4. **Clear functionality**: `clearSpreadsheet()` resets all data and clears localStorage
5. **Storage key**: `spreadsheet-state` contains cells, column widths, row heights, cell formats, and selection

**Performance optimization**: Debouncing prevents localStorage writes on every keystroke, reducing I/O operations and potential quota issues.

## What NOT to Do

❌ Don't add console.log (use debug tools instead)
❌ Don't make properties public without reason
❌ Don't create TODOs (fix or file issue)
❌ Don't skip type annotations
❌ Don't use `any` type unless necessary
❌ Don't import with circular dependencies
❌ Don't create inline styles (use CSS classes from styles.css)
❌ Don't ignore ESLint warnings (especially react-hooks/exhaustive-deps)
❌ Don't forget to memoize expensive calculations in components
❌ Don't manually implement patterns that have custom hooks (useClickOutside, useDebounce)

## Recent Changes

### Latest (Current)

- **Performance & Code Quality Improvements**: Major refactoring for optimization and maintainability
  - **Custom hooks**: Created `useClickOutside` and `useDebounce` hooks to eliminate code duplication
  - **Performance optimization**:
    - Memoized Grid component calculations with `useMemo`
    - Memoized SpreadsheetContext value to prevent unnecessary re-renders
    - Debounced localStorage saves (500ms) to reduce I/O operations
  - **Error handling**:
    - Added `ErrorBoundary` component with graceful error display and recovery
    - **Custom error types** (INTEGRATED): Created and integrated specific error classes throughout codebase:
      - `CircularDependencyError` - Used in EvalEngine for circular dependencies
      - `FormulaParseError` - Used in FormulaParser and FormulaCalculator for syntax errors
      - `CellReferenceError` - Used when referencing invalid/empty cells
      - `DivisionByZeroError` - Used for division by zero errors
      - `FunctionArgumentError` - Used for invalid function arguments
      - `InvalidFunctionError` - Used for unknown function names
  - **UI Testing**: Added comprehensive React component and hook tests
    - Installed React Testing Library, user-event, and jest-dom
    - Added 15 new UI/hook tests (295 total tests)
    - Configured Vitest with jsdom environment for React testing
    - Tests for ErrorBoundary, Cell component, useClickOutside, useDebounce
  - **Code quality**:
    - Extracted magic numbers to named constants (DEFAULT_COLUMN_WIDTH, MIN_ROW_HEIGHT, etc.)
    - Added comprehensive JSDoc comments to CellResultStore
    - Fixed SpreadsheetState type inconsistency (added cellFormats property)
    - Fixed useEffect dependency arrays for proper React behavior
    - Added `data-testid` attributes to components for testing
  - **ESLint improvements**:
    - Added `eslint-plugin-react` and `eslint-plugin-react-hooks`
    - Configured `react-hooks/exhaustive-deps` to catch dependency issues
    - Added React-specific rules for better code quality
    - Fixed deprecated `tseslint.config()` → flat config array
  - **Updated documentation**: README and CLAUDE.md reflect all new patterns and best practices

### Previous

- **Cell Formatting**: Format cells to control display
  - **Format types**: Raw (default), Date (mm/dd/yyyy), Boolean (1→True, 0→False)
  - **Date format**: Converts Unix timestamps (ms) to readable dates
  - **Boolean format**: Displays comparison results (1/0) as True/False
  - **Format dropdown**: Dynamically enumerated from CellFormat enum in formula bar
  - **Format persistence**: Saved in localStorage with cell data
  - **Fallback handling**: Invalid dates/booleans fall back to Raw formatting
  - Created `cell-formatter.ts` utility with `formatCellValue()` function
  - Added `CellFormat` enum in types.ts (Raw, Date, Boolean)
  - Updated `CellResultStore` to use formatter utility
  - Updated `Spreadsheet` class with `getCellFormat()` and `setCellFormat()`
  - Added `setCellFormat()` to SpreadsheetContext
  - Added 21 test cases for formatting functionality (280 total tests)
  - Professional CSS styling for format dropdown with custom arrow
  - Updated InfoDisplay to show raw value, display value, and errors

- **New Functions & Operators**: Expanded formula capabilities
  - **String functions**: `CONCATENATE`/`CONCAT`, `LEFT`, `RIGHT`, `TRIM`, `UPPER`, `LOWER`
  - **Logical functions**: `IF` for conditional logic
  - **Count functions**: `COUNT` for counting numeric values
  - **Date/time functions**: `NOW`, `TODAY`, `DATE`, `DATEDIF` (D/M/Y units)
  - **Comparison operators**: `>`, `<`, `>=`, `<=`, `=` (or `==`), `<>` (or `!=`)
  - **String literals**: Support for double-quoted strings in formulas
  - String literals tokenized as `STRING` type
  - Comparison operators tokenized as `COMPARISON` type
  - Comparison precedence below arithmetic operations
  - Comparisons return 1 (true) or 0 (false) like Excel
  - Added 90+ new test cases for all new functions and operators

- **LocalStorage Persistence**: Automatic save/restore of all spreadsheet data
  - Auto-save on every change (cells, column widths, row heights)
  - Auto-restore on page load with formula re-evaluation
  - Clear button to reset all data with confirmation dialog
  - New `local-storage.ts` module with save/load/clear functions
  - New `exportState()`, `importState()`, and `clear()` methods in Spreadsheet class

- **Function Menu**: Added ƒx button with dropdown menu of all supported functions
- **Info Popover**: Added ⓘ button that shows cell info in a popover
- **Resizable Columns/Rows**: Drag column/row header edges to resize
- **Type-safe Functions**: Centralized function definitions with FunctionName constants
- **UI Improvements**: Moved formula bar above grid, removed unnecessary labels
- **Spreadsheet State**: Added column width and row height management

### Earlier

- **Converted to React**: Replaced vanilla JS with React components
- **Added React Context**: SpreadsheetContext for state management
- **Created React components**: App, Grid, Cell, FormulaBar, InfoDisplay
- **Added custom hooks**: useKeyboardNavigation for keyboard handling
- **Removed old UI files**: ui-renderer.ts, event-handlers.ts, app.ts
- **Updated build config**: Added React plugin to Vite, updated tsconfig.json
- Organized into layered directory structure (core/, data/, ui/)
- Encapsulated Spreadsheet properties

## Getting Help

- **README.md** - User documentation, examples, architecture overview
- **Code comments** - Inline documentation
- **TypeScript errors** - Run `npm run build` for details
- **React DevTools** - Inspect component tree and state
