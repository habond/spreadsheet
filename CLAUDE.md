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
├── types/                   # Type definitions (no index.ts)
│   ├── core.ts              # Core types (CellID, EvalResult, FunctionInfo, etc.)
│   └── ast.ts               # AST node types & type guards
├── errors/                  # Custom error classes (one per file)
│   ├── CircularDependencyError.ts
│   ├── FormulaParseError.ts
│   ├── CellReferenceError.ts
│   ├── DivisionByZeroError.ts
│   ├── FunctionArgumentError.ts
│   └── InvalidFunctionError.ts
├── constants/               # Application constants
│   └── app-constants.ts     # Sizing and default values
├── parser/                  # Formula parsing (pure, stateless)
│   ├── tokenizer.ts         # Lexical analysis
│   ├── ast-parser.ts        # Builds AST from tokens
│   ├── formula-parser.ts    # parse(), extractCellReferences()
│   └── helpers.ts           # expandRange utility
├── evaluator/               # Formula evaluation (stateless)
│   ├── formula-evaluator.ts # Evaluates AST nodes
│   ├── __tests__/           # Integration tests for formula evaluation
│   │   └── formula-evaluator.test.ts  # Tests operators, precedence, cell refs, function integration
│   └── functions/           # Function implementations (one per file)
│       ├── sum.ts, average.ts, min.ts, max.ts, add.ts, sub.ts, mul.ts, div.ts, count.ts
│       ├── if.ts            # Logic functions
│       ├── countif.ts, sumif.ts, sumifs.ts  # Conditional functions
│       ├── vlookup.ts, hlookup.ts, index.ts, match.ts  # Lookup functions
│       ├── concatenate.ts, left.ts, right.ts, trim.ts, upper.ts, lower.ts
│       ├── now.ts, today.ts, date.ts, datedif.ts
│       ├── helpers.ts       # flattenArgs, toNumber, toBoolean
│       ├── function-registry.ts  # Function registry, metadata, executor
│       └── __tests__/       # Unit tests for individual functions (one per function)
├── engine/                  # Evaluation orchestration
│   ├── dependency-graph.ts  # Tracks cell dependencies
│   └── eval-engine.ts       # Main orchestrator
├── utils/                   # Pure utility functions
│   └── column-utils.ts      # Column letter/number conversion (columnToNumber, numberToColumn)
├── formatter/               # Cell formatting (one per format type)
│   ├── helpers.ts           # toNumberOrFallback helper
│   ├── format-raw.ts        # Raw format (no formatting)
│   ├── format-number.ts     # Number format (1,234.56)
│   ├── format-currency.ts   # Currency format ($1,234.56)
│   ├── format-percentage.ts # Percentage format (75.00%)
│   ├── format-date.ts       # Date format
│   ├── format-time.ts       # Time format
│   ├── format-boolean.ts    # Boolean format (True/False)
│   └── cell-formatter.ts    # Main formatter orchestrator
├── model/                   # Data model layer
│   ├── spreadsheet.ts       # Cell storage, navigation, clipboard (copy/paste/cut), fill handle
│   ├── cell-result-store.ts # Evaluation cache with JSDoc
│   └── local-storage.ts     # LocalStorage persistence
├── ui/                      # React UI layer
│   ├── components/          # React components
│   │   ├── App.tsx          # Main app layout with ErrorBoundary
│   │   ├── Grid.tsx         # Spreadsheet grid with resize & fill handle drag logic
│   │   ├── Cell.tsx         # Individual cell with fill handle UI (uses useCellValue)
│   │   ├── FormulaBar.tsx   # Formula input with function & format menus
│   │   ├── FunctionMenu.tsx # Function dropdown with useClickOutside
│   │   ├── InfoButton.tsx   # Info popover with cell display
│   │   └── ErrorBoundary.tsx # Error handling component
│   ├── contexts/            # React contexts
│   │   └── SpreadsheetContext.tsx  # Main spreadsheet state (minimal, optimized)
│   └── hooks/               # Custom hooks
│       ├── useCellValue.tsx       # Granular cell subscription with useSyncExternalStore
│       ├── useKeyboardNavigation.tsx  # Arrow keys, Tab, Enter, Delete, Copy/Paste/Cut shortcuts
│       ├── useClickOutside.tsx  # Reusable click-outside handler
│       └── useDebounce.tsx      # Debounce hook for performance
└── main.tsx                 # React entry point
```

## Key Concepts

### Data Flow

```
User Input → FormulaBar → SpreadsheetContext → Spreadsheet (raw) → EvalEngine → CellResultStore
                                    ↓                                                  ↓
                              localStorage (debounced)              notifyListeners(cellId)
                                                                                      ↓
                                                              useCellValue (useSyncExternalStore)
                                                                                      ↓
                                                              Only affected Cells re-render
```

**Optimization Note**: Cells use `useCellValue` hook with React's `useSyncExternalStore` to subscribe only to their specific cell data. This means:
- Editing A1 only re-renders A1 (and its dependents)
- Resizing columns/rows only re-renders Grid component, not cells
- Zero unnecessary re-renders across the entire grid

### Architecture Layers

- **Types**: Centralized type definitions (CellID, EvalResult, AST nodes)
- **Errors**: Custom error classes (one per file)
- **Constants**: Application-wide configuration values
- **Parser**: Pure parsing logic (tokenization → AST, range expansion)
- **Evaluator**: Pure evaluation logic (AST → result, function implementations - one per file)
- **Engine**: Orchestration (dependency tracking, evaluation order)
- **Utils**: Pure utility functions (column conversions)
- **Formatter**: Cell formatting functions (one per format type)
- **Model**: Data model layer (Spreadsheet, CellResultStore with pub-sub, localStorage)
- **UI**: React components (App, Grid, Cell, FormulaBar, FunctionMenu, InfoButton, ErrorBoundary)
- **Hooks**: Reusable custom hooks (useCellValue with useSyncExternalStore, useKeyboardNavigation, useClickOutside, useDebounce)
- **Contexts**: React Context providers (SpreadsheetContext with minimal re-renders)

**Dependency Flow**: `types` → `errors` → `constants` → `utils` → `parser` → `evaluator` → `engine` → `formatter` → `model` → `ui`

### Formula Evaluation

The formula evaluation system uses a three-phase architecture:

1. **Tokenization** (`formula-parser.ts`): Convert formula string into tokens
   - Lexical analysis: numbers, strings, operators, cell refs, ranges, functions
   - Pattern matching for cell references (A1, AA10) and ranges (A1:B3)

2. **Parsing** (`ast-parser.ts`): Build Abstract Syntax Tree (AST) from tokens
   - Recursive descent parser with operator precedence
   - Creates structured tree representation (NumberNode, BinaryOpNode, FunctionCallNode, etc.)
   - Proper precedence: Comparison < Addition/Subtraction < Multiplication/Division
   - Supports parenthesized expressions and unary operators
   - **Ranges are stored as 2D arrays in row-major order** (e.g., A1:C2 → `[["A1", "B1", "C1"], ["A2", "B2", "C2"]]`)

3. **Evaluation** (`formula-evaluator.ts`): Walk the AST to compute results
   - Evaluates AST nodes recursively
   - Resolves cell references from pre-computed results
   - **Cell references return 1x1 2D arrays** for consistency (e.g., A1 → `[[value]]`)
   - **Unwraps single-cell arrays** in binary/unary operations and at top level
   - Executes functions via `function-registry.ts`
   - Type checking and error handling

4. **Dependency Management** (`dependency-graph.ts`): Track cell dependencies
   - Extracts cell references from formulas
   - Detects circular dependencies
   - Topological sort for correct evaluation order

**Key Benefits of AST Architecture:**
- Clear separation of concerns (tokenization, parsing, evaluation)
- Can inspect/optimize formulas before evaluation
- Easier to add new features (formula visualization, static analysis)
- More maintainable and testable

**2D Range Architecture:**
- All cell references and ranges are represented as 2D arrays internally
- Preserves rectangular structure for functions that need it (SUMIF, SUMIFS, VLOOKUP, etc.)
- Row-major ordering matches natural spreadsheet reading (left-to-right, top-to-bottom)
- Functions use `expandArgs()` to flatten 2D arrays when they just need all values
- Type aliases keep signatures clean and semantic

**Type Alias System:**
Core types in `types/core.ts` provide semantic clarity and maintainability:
- **Identity Types**: `CellID` (cell identifier string)
- **Position Types**: `CellPosition` (row/col coordinates)
- **Value Types**: `CellValue` (number | string), `CellValueNullable` (includes null for empty cells)
- **Range Types**: `RangeReference` (range string like "A1:B3"), `CellGrid` (2D array of cell IDs), `CellRangeValues` (2D array of values)
- **Evaluation Types**: `ScalarOrRange` (internal evaluation results), `EvalResult` (computation result)
- **Function Types**: `FunctionArg`, `FunctionArgs` (for function signatures)
- **Operator Types**: `ArithmeticOperator`, `ComparisonOperator`, `BinaryOperator`, `UnaryOperator` (type-safe operators)
- **Callback Types**: `GetCellValueFn`, `GetCellResultFn`, `SetCellResultFn` (dependency injection)
- **Persistence Types**: `ColumnWidthEntry`, `RowHeightEntry`, `CellFormatEntry` (tuple types for serialization)

Benefits: Single source of truth, self-documenting code, easier refactoring, compile-time safety

## Code Conventions

### Import Paths & Module Organization

**IMPORTANT: No index.ts Pattern**
- ❌ **Never use index.ts files** - They create ambiguity and complicate navigation
- ✅ **Always import directly from specific files**
- ✅ **One concept per file**: Each error, function, class, or type module has its own file
- ✅ **Explicit is better than implicit**: Always know exactly where code comes from

**Why avoid index.ts:**
1. IDE "Go to Definition" takes you to the actual implementation, not a re-export file
2. No confusion about what's exported from a directory
3. Better tree-shaking - bundlers can eliminate unused code more effectively
4. Clearer dependency tracking - you see exactly what files depend on what
5. Easier refactoring - moving files doesn't break index-based re-exports
6. No circular dependency risks from index files importing from each other

**Import Examples:**
- Types: `import { CellID, CellValue, CellValueNullable, FunctionArgs } from '../types/core'`
- Operators: `import { ArithmeticOperator, ComparisonOperator } from '../types/core'`
- Errors: `import { FormulaParseError } from '../errors/FormulaParseError'`
- Parser: `import { parse } from '../parser/formula-parser'`
- Evaluator: `import { FormulaCalculator } from '../evaluator/formula-evaluator'`
- Functions: `import { sum } from '../evaluator/functions/sum'`
- Function Registry: `import { FunctionName } from '../evaluator/functions/function-registry'`
- Engine: `import { EvalEngine } from '../engine/eval-engine'`
- Constants: `import { DEFAULT_COLUMN_WIDTH } from '../constants/app-constants'`
- Utils: `import { columnToNumber } from '../utils/column-utils'`
- Formatters: `import { formatAsNumber } from '../formatter/format-number'`
- Formatter Main: `import { formatCellValue } from '../formatter/cell-formatter'`
- Model: `import { Spreadsheet } from '../model/spreadsheet'`

**Other conventions:**
- React components use `.tsx` extension
- No need for `.js` extensions in imports (Vite handles this)
- Use relative paths: `../types/types`, not absolute paths

### TypeScript

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- All types in `types/core.ts`
- Add JSDoc comments for public APIs

### React Best Practices

- Use `useMemo` for expensive calculations
- Use `useCallback` for callbacks passed to child components
- Memoize context values to prevent unnecessary re-renders (include updateTrigger in dependencies)
- Use custom hooks for reusable logic (useClickOutside, useDebounce)
- Always include proper dependency arrays in useEffect
- Run ESLint before committing (catches React Hooks issues)
- Avoid React.memo for components that need to react to context changes

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

1. Create a new file in `src/evaluator/functions/` (e.g., `my-function.ts`)
2. Implement the function using helpers from `helpers.ts`:
   - Use `requireExactly()`, `requireAtLeastOne()`, etc. for argument validation
   - Use `toNumber()`, `toBoolean()` for type conversion
   - Use `createBinaryOperation()` or `createUnaryStringOperation()` for simple operations
3. Add function metadata to `SUPPORTED_FUNCTIONS` array in `formula-evaluator.ts`
4. Add constant to `FunctionName` object in `function-registry.ts` for type safety
5. Import and add to `executeFunction()` in `function-registry.ts`
6. Write tests in `formula-evaluator.test.ts`
7. Update README.md formula list

**Important**: Each function has its own file. Use the helper factories in `helpers.ts` to reduce boilerplate.

### Add a New Formatter

1. Create a new file in `src/formatter/` (e.g., `format-scientific.ts`)
2. Implement the formatter function:
   - Use `toNumberOrFallback()` from `helpers.ts` if you need numeric validation
   - Return formatted string or fall back to raw display for invalid values
   - Handle null values appropriately
3. Add new format type to `CellFormat` enum in `types/core.ts`
4. Import and add case to `formatCellValue()` switch in `cell-formatter.ts`
5. Write tests in `__tests__/format-scientific.test.ts`
6. Add format option to dropdown in `FormulaBar.tsx`

**Important**: Each formatter has its own file. Follow the same pattern as existing formatters (format-number.ts, format-currency.ts, etc.).

### Add a New Component

1. Create `.tsx` file in `ui/components/`
2. Use `useSpreadsheet()` hook to access state
3. Export as named or default export
4. Add `data-testid` attributes for testing
5. Write component tests in `__tests__/ComponentName.test.tsx`
6. Follow existing patterns for consistency

### Add a New Module

1. Place in appropriate layer (types, errors, constants, parser, evaluator, engine, utils, formatter, model, or ui)
2. Import types from `types/core.ts`
3. Follow the dependency flow: types → errors → constants → utils → parser → evaluator → engine → formatter → model → ui
4. Maintain separation of concerns

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

- **Integration tests**: `src/evaluator/__tests__/formula-evaluator.test.ts` - Tests operators, precedence, cell references, and function integration
- **Unit tests**: `src/evaluator/functions/__tests__/*.test.ts` - Individual function tests (one per function)
- **Parser tests**: `src/parser/__tests__/*.test.ts` - Tokenization, AST parsing, range expansion
- **Engine tests**: `src/engine/__tests__/*.test.ts` - Dependency tracking, evaluation orchestration
- **Model tests**: `src/model/__tests__/*.test.ts` - Spreadsheet data model, formatting, persistence
- **Formatter tests**: `src/formatter/__tests__/*.test.ts` - Cell formatting (one per format type)
- **Component tests**: `src/ui/components/__tests__/*.test.tsx` - React components
- **Render optimization tests**: `src/ui/components/__tests__/render-optimization.test.tsx` - 12 tests validating granular re-rendering with pub-sub
- **Hook tests**: `src/ui/hooks/__tests__/*.test.tsx` - Custom React hooks
- **Utility tests**: `src/utils/__tests__/*.test.ts` - Pure utility functions

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
// Keyboard navigation (Arrow keys, Tab, Enter, Delete, Copy/Paste/Cut)
function useKeyboardNavigation(inputRef: RefObject<HTMLInputElement | null>) {
  // Handles navigation, cell editing, and clipboard operations
  // Cmd/Ctrl+C/X/V for copy/cut/paste (only when formula bar not focused)
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

Prevent unnecessary re-renders using useMemo for expensive calculations:

```typescript
// Value memoization in components
const gridStyle = useMemo(
  () => ({
    gridTemplateColumns: columnWidths.map(w => `${w}px`).join(' '),
    gridTemplateRows: rowHeights.map(h => `${h}px`).join(' '),
  }),
  [columnWidths, rowHeights]
);

// Context value memoization with updateTrigger
const contextValue = useMemo(
  () => ({ spreadsheet, evalEngine, selectCell, updateCell }),
  [spreadsheet, evalEngine, selectCell, updateCell, updateTrigger]
);
```

**Note**: Cell components are not memoized with `React.memo()` to ensure they re-render when formats or values change via context updates. For a 20x10 grid, the performance impact is negligible.

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

## Standard Development Practices

**Before Committing Code:**

1. **Run tests**: `npm run test:run` - Ensure all tests pass
2. **Run coverage**: `npm run test:coverage` - Verify test coverage remains high
3. **Run lint**: `npm run lint` - Check for ESLint warnings
4. **Run format**: `npm run format` - Apply Prettier formatting
5. **Build verification**: `npm run build` - Verify TypeScript compilation
6. **Update documentation**: Update README.md and CLAUDE.md as needed

**Type Safety:**

- ❌ **Never use `any` type** - Use proper TypeScript types
- ✅ For intentionally invalid test inputs, use `@ts-expect-error` with explanatory comments
- Example:
  ```typescript
  // @ts-expect-error - Testing invalid input (1D array instead of 2D)
  expect(() => hlookup([1, [1, 2, 3], 2, 0])).toThrow(FunctionArgumentError);
  ```

## What NOT to Do

❌ Don't add console.log (use debug tools instead)
❌ Don't make properties public without reason
❌ Don't create TODOs (fix or file issue)
❌ Don't skip type annotations
❌ Don't use `any` type (use `@ts-expect-error` with comments for test edge cases)
❌ Don't import with circular dependencies
❌ Don't create inline styles (use CSS classes from styles.css)
❌ Don't ignore ESLint warnings (especially react-hooks/exhaustive-deps)
❌ Don't forget to memoize expensive calculations in components
❌ Don't manually implement patterns that have custom hooks (useClickOutside, useDebounce)
❌ Don't add counts to documentation (line counts, test counts) - they change frequently and become stale

## Recent Changes

### Latest (Current)

- **Fill Handle Implementation**: Added Excel/Google Sheets-style fill handle for copying cell content and formatting
  - **Fill handle UI** ([Cell.tsx:43](src/ui/components/Cell.tsx#L43)):
    - Small blue square (8x8px) appears in bottom-right corner of selected cell
    - Crosshair cursor with hover effect (enlarges to 10x10px)
    - Only visible when cell is selected
  - **Drag interaction** ([Grid.tsx:15-18,51-66,68-88](src/ui/components/Grid.tsx#L15-L18)):
    - Click and drag fill handle to select range
    - Supports horizontal and vertical fills (not diagonal)
    - Visual preview with blue highlighting during drag
    - Uses capture phase (`onMouseDownCapture`) to intercept events before cell click
  - **Spreadsheet model methods** ([spreadsheet.ts:338-388](src/model/spreadsheet.ts#L338-L388)):
    - `getFillRangeCells(startCellId, endCellId)` - Returns array of cell IDs for preview (no side effects)
    - `fillRange(startCellId, endCellId)` - Fills cells and returns array of affected cell IDs
    - Copies both cell content (values/formulas) and cell format
    - Supports bi-directional fills (drag left/right/up/down)
  - **Context integration** ([SpreadsheetContext.tsx:199-211](src/ui/contexts/SpreadsheetContext.tsx#L199-L211)):
    - Exposed `fillRange` method in context
    - Triggers formula re-evaluation for all affected cells
    - Debounced save to localStorage after fill
  - **Visual feedback** (styles.css:195-220):
    - Blue fill handle with white border (`.fill-handle`)
    - Blue background and outline on cells being filled (`.cell.fill-highlight`)
    - Clear indication of fill direction and range
  - **Code quality improvements**:
    - Eliminated duplication by using `getFillRangeCells()` for both preview and actual fill
    - Clean separation between preview logic (Grid) and fill logic (Spreadsheet)
    - Transient drag state kept local to Grid component (not persisted)
  - **Test coverage**:
    - Added 18 comprehensive unit tests for fill range functionality
    - Tests cover horizontal/vertical fills, reverse direction, edge cases, large ranges
    - All 959 tests passing (up from 941)
  - **Documentation**:
    - Updated README with fill handle feature description
    - Updated CLAUDE.md with implementation details
  - **Benefits**: Excel/Google Sheets-like UX for quickly duplicating cell content and formatting across ranges

### Previous

- **Copy/Paste/Cut Implementation**: Added full clipboard functionality with keyboard shortcuts and visual feedback
  - **Clipboard state management**:
    - `ClipboardData` interface with `content`, `format`, and `sourceCellId`
    - Internal clipboard stores snapshot of cell content and format at copy time (not references)
    - Transient state (not persisted to localStorage)
  - **Spreadsheet model methods**:
    - `copyCell()` - Captures selected cell content and format as snapshot
    - `cutCell()` - Copies then clears original cell and resets format
    - `pasteCell()` - Pastes clipboard content to selected cell (returns boolean)
    - `getCopiedCell()` - Returns source cell ID for visual feedback
    - `clearClipboard()` - Clears clipboard and copied cell indicator
  - **Context integration**:
    - Exposed `copyCell`, `cutCell`, `pasteCell`, `clearClipboard` methods
    - Added `copiedCell` state with React state updates for visual feedback
    - Proper debounced save after cut/paste operations
  - **Keyboard shortcuts** (in `useKeyboardNavigation`):
    - **Cmd/Ctrl+C**: Copy selected cell
    - **Cmd/Ctrl+X**: Cut selected cell
    - **Cmd/Ctrl+V**: Paste clipboard content
    - **Escape**: Clear clipboard indicator
    - Only active when formula bar is NOT focused (preserves text editing in formula bar)
  - **Visual feedback**:
    - Animated dashed green border on copied cells (.cell.copied CSS class)
    - "Marching ants" animation effect with keyframes
    - Border automatically clears after paste or Escape key
  - **Test coverage**:
    - Added 23 comprehensive unit tests for Spreadsheet clipboard methods
    - Added 5 keyboard shortcut integration tests
    - All 930 tests passing
  - **Documentation**:
    - Updated README with copy/paste feature and keyboard shortcuts
    - Updated CLAUDE.md with implementation details
    - Moved "smart paste with reference adjustment" to future roadmap
  - **Benefits**: Enables efficient cell duplication with content and formatting, standard spreadsheet UX with familiar keyboard shortcuts

### Previous

- **Performance Optimization with Pub-Sub Architecture**: Implemented granular re-rendering using React's `useSyncExternalStore`
  - **CellResultStore pub-sub**:
    - Added `subscribe()` method for cell-specific subscriptions
    - Added `notifyListeners()` to notify only affected cell subscribers
    - Listeners Map tracks subscribers per cell ID
  - **useCellValue hook**:
    - New custom hook using `useSyncExternalStore` for efficient cell subscriptions
    - Snapshot caching to prevent infinite loops
    - Each cell subscribes only to its own data changes
  - **Cell component optimization**:
    - Replaced direct context access with `useCellValue` hook
    - Cells now only re-render when their specific data changes
    - Zero re-renders on column/row resizing
  - **Grid component isolation**:
    - Local `renderTrigger` state for size changes
    - Only Grid re-renders on resize, cells remain untouched
  - **Context streamlining**:
    - Removed global `uiUpdateTrigger` mechanism
    - Minimal, focused context updates
  - **Test coverage**:
    - Added 12 comprehensive render optimization tests
    - Tests validate cell isolation, formula dependencies, format changes, Grid behavior
  - **Results**: All 804 tests passing (12 new), zero re-renders on unrelated changes, production-ready optimization

### Previous

- **Code Quality Cleanup**: Comprehensive codebase refactoring to address linting and type safety issues
  - **High priority fixes**:
    - Fixed failing useDebounce test (increased timeout and polling interval)
    - Removed console.error from ErrorBoundary (replaced with explanatory comment)
    - Fixed unused error variables in local-storage.ts (removed unused parameters)
    - Replaced `any` types in test files with proper TypeScript types
  - **Medium priority fixes**:
    - Changed `let` to `const` in vlookup.ts for immutable variable
    - Fixed FormulaBar useEffect dependency array (removed complex expression)
    - Removed stale test counts from documentation
    - Auto-fixed 41 Prettier formatting warnings
  - **Documentation improvements**:
    - Added comprehensive JSDoc to DependencyGraph class
    - Enhanced Spreadsheet class documentation with responsibilities
    - Added detailed JSDoc with examples to formatCellValue function
  - **ESLint cleanup**:
    - Added suppression comment for intentional updateTrigger dependency
    - Zero ESLint warnings across entire codebase
  - **Results**: All 784 tests passing, build successful, zero TypeScript errors, zero ESLint warnings

### Earlier

- **Type Alias System Improvements**: Comprehensive type system enhancement for better readability and maintainability
  - **Phase 1 - High Priority Types** (value, evaluation, operator types):
    - `CellValueNullable` - replaces verbose `number | string | null` (10+ locations)
    - `ScalarOrRange` - clearer name for internal evaluation results
    - `ArithmeticOperator`, `ComparisonOperator`, `BinaryOperator`, `UnaryOperator` - type-safe operators
    - Updated all 9 formatters to use `CellValueNullable`
    - Updated formula evaluator to use `ScalarOrRange` and operator types
  - **Phase 2 - Medium Priority Types** (geometry, range, persistence types):
    - `CellPosition` - replaces inline `{ row: number; col: number }` for cell coordinates
    - `RangeReference` - semantic type for range strings like "A1:B3"
    - `CellGrid` - replaces `CellID[][]` for 2D arrays of cell IDs
    - `ColumnWidthEntry`, `RowHeightEntry`, `CellFormatEntry` - tuple types for Map serialization
    - Updated parser helpers, AST types, spreadsheet model, and local-storage
  - **Benefits**:
    - Single source of truth for complex types
    - Self-documenting code (semantic names vs verbose unions)
    - Type safety for operators (exhaustive switch checking)
    - Better persistence layer clarity with labeled tuples
    - Easier refactoring (change type once, affects all usage)

- **2D Range Architecture Implementation**: Complete rewrite of range handling
  - **Pure 2D design**: All cell references and ranges represented as 2D arrays
    - Cell refs: `A1` → `[[value]]` (1x1 array)
    - Ranges: `A1:C2` → `[["A1", "B1", "C1"], ["A2", "B2", "C2"]]` (row-major)
  - **Parser updates**:
    - `expandRange()` returns 2D arrays in row-major order
    - `extractCellReferences()` handles 2D structure
    - Single cells handled consistently
  - **Evaluator updates**:
    - Unwraps single-cell arrays in operations and at top level
    - Functions receive 2D arrays directly
  - **Function updates**:
    - Simple aggregates (SUM, AVERAGE, etc.) use `expandArgs()` to flatten
    - Conditional functions (SUMIF, SUMIFS, COUNTIF) work with 2D structure
    - All 23 functions updated to use `FunctionArgs` type
  - **Test infrastructure**:
    - Created shared `to2D()` test utility
    - Updated all parser tests for 2D expectations
    - All function tests use proper 2D arrays
  - **Benefits**:
    - Better support for 2D-aware functions (SUMIF, VLOOKUP, etc.)
    - Consistent architecture (everything is 2D, no special cases)
    - Row-major ordering matches natural spreadsheet layout

### Previous

- **Conditional Functions Implementation**: Added range-based conditional functions
  - **Implemented COUNTIF**: Count cells in range that meet criteria
    - Supports comparison operators: `>`, `<`, `>=`, `<=`, `=`, `<>`
    - Supports exact text matching (case-insensitive)
    - Example: `=COUNTIF(A1:A10, ">5")` counts cells where value > 5
  - **Implemented SUMIF**: Sum cells based on criteria
    - 2 or 3 argument form: `SUMIF(range, criteria, [sum_range])`
    - Example: `=SUMIF(A1:A10, ">=10")` sums cells >= 10
  - **Implemented SUMIFS**: Sum with multiple criteria (AND logic)
    - Example: `=SUMIFS(C1:C10, A1:A10, ">5", B1:B10, "apple")`
  - **Created individual test files**: Split all function tests into individual files (one per function)
    - 23 function test files in `src/evaluator/functions/__tests__/`
    - Each function has comprehensive unit tests
  - **Refactored integration tests**: Cleaned up `formula-evaluator.test.ts`
    - Removed duplicate function tests (now in individual files)
    - Focused on testing operators, precedence, cell references, error handling
    - Light integration testing to ensure functions work within formulas
    - Reduced from 110 tests to 48 tests (removed 62 duplicates)
  - **Updated documentation**: README.md and CLAUDE.md with new functions and test organization

### Previous

- **Keyboard Input Enhancement**: Improved cell editing behavior to match Excel/Google Sheets
  - **Typing replaces cell content**: When a cell is focused (but formula bar is not), typing any character now replaces the entire cell value instead of appending to it
    - Updated `useKeyboardNavigation` hook to set `formulaInput.value = e.key` and focus the input
    - Positions cursor at end of input for continued typing
  - **Delete/Backspace clears both cell and formula bar**: Pressing Delete or Backspace clears the cell data and immediately updates the formula bar
    - Calls `updateCell(selectedCell, '')` to clear cell in data model
    - Sets `formulaInput.value = ''` for instant visual feedback
    - Updated `FormulaBar` useEffect to depend on cell content for reactive updates
  - **Benefits**:
    - More intuitive editing experience matching standard spreadsheet behavior
    - Immediate visual feedback with proper React state synchronization
    - No need to manually clear cell before entering new value

### Previous

- **Parser Module Consolidation**: Moved range-helpers into parser module
  - **Moved `range-helpers.ts` → `parser/helpers.ts`**: Range expansion is parser-specific functionality
    - Only used by `ast-parser.ts` and `formula-parser.ts`
    - `expandRange()` is a parsing utility, not a general-purpose utility
  - **Updated imports**: Changed `../utils/range-helpers` → `./helpers` in parser files
  - **Updated tests**: Moved test file to `parser/__tests__/helpers.test.ts`
  - **Simplified utils/**: Now only contains `column-utils.ts` (truly general-purpose)
  - **Benefits**:
    - Better encapsulation - parser utilities live with parser code
    - Clearer module boundaries - utils/ is now only for cross-cutting utilities
    - Easier to understand parser dependencies at a glance

- **Formatter Module Refactoring**: Reorganized cell formatting with one formatter per file
  - **Created `src/formatter/` directory**: New top-level module for cell formatting
    - 8 individual formatter files: `format-raw.ts`, `format-number.ts`, `format-currency.ts`, `format-percentage.ts`, `format-date.ts`, `format-time.ts`, `format-boolean.ts`
    - `helpers.ts` with shared `toNumberOrFallback()` utility
    - `cell-formatter.ts` as main orchestrator (formatCellValue function)
  - **Individual test files**: Each formatter has its own test file with comprehensive coverage
    - Split tests from `model/__tests__/cell-formatting.test.ts` into 7 individual test files
    - Integration tests remain in model layer, unit tests in formatter layer
  - **Updated imports**: Changed `../utils/cell-formatter` → `../formatter/cell-formatter`
  - **Removed old file**: Deleted `src/utils/cell-formatter.ts`
  - **Benefits**:
    - Consistent with function implementations pattern (one per file)
    - Each formatter is independently testable and importable
    - Clear separation between formatting logic and data model
    - Easier to add new formatters (just add a new file)
    - Better code organization following established patterns

### Previous

- **Final Code Organization Refinements**: Maximum granularity for clarity and maintainability
  - **One function per file**: Split all function implementations into individual files
    - 23 individual function files: `sum.ts`, `average.ts`, `min.ts`, `if.ts`, `concatenate.ts`, etc.
    - Each function is now independently importable and testable
    - Function registry (`function-registry.ts`) imports from individual files
  - **Renamed data → model**: Better semantic naming
    - `src/data/` → `src/model/` (more accurate - it's the data model layer)
  - **Documented 'no index.ts' best practice**: Added comprehensive rationale to CLAUDE.md
    - 6 specific reasons why index.ts should be avoided
    - Clear import examples for all module types
  - **Benefits**:
    - Each function is a complete, isolated module
    - IDE can jump directly to function implementation
    - Better code splitting and tree-shaking
    - Easier to find, understand, and modify individual functions
    - No ambiguity about module boundaries

### Previous

- **Code Organization Improvements**: Further refined structure for maximum clarity
  - **Eliminated index.ts pattern**: All imports are now explicit and direct
  - **One error per file**: Split `errors/index.ts` into individual files
  - **Moved constants**: `utils/constants.ts` → `constants/constants.ts` (top-level)
  - **Added contexts directory**: `ui/SpreadsheetContext.tsx` → `ui/contexts/SpreadsheetContext.tsx`

### Previous

- **Directory Reorganization**: Completely restructured codebase for better modularity and clarity
  - **Eliminated overloaded `core/` directory**: Replaced with focused, single-responsibility modules
  - **New flat structure**: `types/`, `errors/`, `parser/`, `evaluator/`, `engine/`, `constants/`, `utils/`, `data/`, `ui/`
  - **Function categorization**: Split function-executor into categorized files (math, logic, string, datetime, helpers)
  - **Clear dependency flow**: Linear dependencies from types → errors → constants → utils → parser → evaluator → engine → data → UI

### Previous

- **AST-Based Formula Evaluation**: Refactored formula evaluation to use proper Abstract Syntax Tree
  - **Created `ast-types.ts`**: Type-safe AST node definitions
    - Node types: NumberNode, StringNode, CellRefNode, RangeNode, BinaryOpNode, UnaryOpNode, FunctionCallNode
    - Type guards for safe AST traversal (isNumberNode, isBinaryOpNode, etc.)
    - Clear representation of formula structure
  - **Created `ast-parser.ts`**: Dedicated parser that builds AST from tokens
    - Recursive descent parser with proper operator precedence
    - Converts flat token stream into hierarchical tree structure
    - Clean separation from tokenization logic
  - **Refactored `formula-parser.ts`**: Now only handles tokenization
    - Lexical analysis: numbers, strings, operators, cell refs, ranges, functions
    - New `parse()` method that delegates to ASTParser
    - Maintains backwards compatibility with existing APIs
  - **Refactored `formula-calculator.ts`**: Now evaluates AST nodes instead of tokens
    - `evaluate()` method recursively walks AST
    - Type-safe node handling using type guards
    - Cleaner separation of parsing and evaluation concerns
  - **Architecture improvements**:
    ```
    formula-parser.ts → tokenize() → [Token]
                     ↓
    ast-parser.ts    → parse()    → ASTNode (tree structure)
                     ↓
    formula-calculator.ts → evaluate() → number | string | array
    ```
  - **Benefits**:
    - Clear separation between parsing and evaluation
    - Can inspect/transform AST before evaluation
    - Easier to add features like formula visualization or optimization
    - More maintainable and testable architecture
  - **Added comprehensive tests**: New test suite for `parse()` method validates AST structure
  - **No functional changes** - Pure architectural refactoring

### Previous

- **Module Refactoring**: Split large files into focused, maintainable modules
  - Created `range-utils.ts` for range operations
  - Created `function-executor.ts` for function implementations
  - Reduced `formula-calculator.ts` and `formula-parser.ts` complexity
  - Clear module boundaries and dependencies

### Previous

- **Range Expressions**: Full support for cell ranges in formulas
  - **Range syntax**: `A1:B3` expands to all cells in the rectangular region
  - **Tokenization**: Added `RANGE` token type to formula-parser.ts
  - **Range expansion**: `expandRange()` converts `A1:B3` into array of cell IDs (column-by-column order)
  - **Column conversion utilities**: `columnToNumber()` and `numberToColumn()` for A↔1, Z↔26, AA↔27, etc.
  - **Dependency tracking**: `extractCellReferences()` automatically expands ranges for dependency graph
  - **Function support**: SUM, AVERAGE, MIN, MAX, COUNT accept ranges as arguments
  - **Mixed arguments**: Functions can accept both ranges and individual cells: `SUM(A1:A5, B1, C1:C3)`
  - **Multiple ranges**: Functions can accept multiple ranges: `AVERAGE(A1:A5, B1:B5)`
  - **Empty cell handling**: Empty cells in ranges are skipped (don't contribute to calculations)
  - **Error handling**: Clear errors for invalid ranges (reversed, malformed) and misuse (ranges in expressions)
  - **Type safety**: ParseResult now supports arrays for range values
  - **Flattening**: `flattenArgs()` helper automatically flattens nested arrays from ranges
  - **Restrictions**: Ranges can only be used as function arguments, not directly in arithmetic/comparisons
  - **Comprehensive tests**: 60+ tests covering tokenization, expansion, functions, error handling
  - **Documentation**: Updated README.md with range syntax, examples, and error messages

### Previous

- **Keyboard Deletion Enhancement**: Improved cell deletion behavior
  - **Delete/Backspace keys**: When a cell is focused (but formula bar is NOT focused), pressing Delete or Backspace now immediately clears the entire cell contents
  - Calls `updateCell(selectedCell, '')` to persist the deletion
  - Formula bar remains unfocused after deletion
  - When formula bar IS focused, Delete/Backspace perform normal text editing (single character deletion)
  - Added 4 comprehensive tests in `useKeyboardNavigation.test.tsx` covering all scenarios
  - Matches standard spreadsheet behavior (Excel/Google Sheets)

- **Component Consolidation**: Simplified component architecture
  - **Merged InfoButton + InfoDisplay**: Combined two tightly-coupled components into single InfoButton component
  - Improved maintainability by co-locating popover UI logic with cell display logic
  - Consolidated related tests into organized test suites
  - No functional changes - all tests passing

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
    - Configured Vitest with jsdom environment for React testing
    - Full test coverage for all components: ErrorBoundary, Cell, FormulaBar, FunctionMenu, InfoButton, Grid
    - Full test coverage for all custom hooks: useClickOutside, useDebounce, useKeyboardNavigation
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
  - **Format types**: Raw (default), Number, Currency, Percentage, Date, Time, Boolean
    - **Raw**: Display values as-is
    - **Number**: Thousands separator with 2 decimals (1,234.56)
    - **Currency**: Dollar format with symbol ($1,234.56)
    - **Percentage**: Multiply by 100 and add % (0.75 → 75.00%)
    - **Date**: Format timestamps using browser locale (toLocaleDateString)
    - **Time**: Format timestamps as time using browser locale (toLocaleTimeString)
    - **Boolean**: Display 1 as "True", 0 as "False"
  - **Locale support**: All formatters use browser locale (undefined) for internationalization
  - **Format dropdown**: Grouped dropdown with visual separators in formula bar
  - **Format persistence**: Saved in localStorage with cell data
  - **Fallback handling**: Invalid values fall back to Raw formatting
  - Created `cell-formatter.ts` utility with `formatCellValue()` function
  - Added `CellFormat` enum in types.ts with all format types
  - Updated `CellResultStore` to use formatter utility
  - Updated `Spreadsheet` class with `getCellFormat()` and `setCellFormat()`
  - Added `setCellFormat()` to SpreadsheetContext
  - Professional CSS styling for format dropdown with grouped options
  - InfoButton displays raw value, display value, and errors

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
  - Added React Context (SpreadsheetContext) for state management
  - Created React components: App, Grid, Cell, FormulaBar, InfoButton
  - Added custom hooks: useKeyboardNavigation for keyboard handling
  - Removed old UI files: ui-renderer.ts, event-handlers.ts, app.ts
  - Updated build config: Added React plugin to Vite, updated tsconfig.json
  - Organized into layered directory structure (core/, data/, ui/)
  - Encapsulated Spreadsheet properties

## Getting Help

- **README.md** - User documentation, examples, architecture overview
- **Code comments** - Inline documentation
- **TypeScript errors** - Run `npm run build` for details
- **React DevTools** - Inspect component tree and state
