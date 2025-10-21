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
│   └── types.ts             # Shared types
├── data/                    # Data layer
│   ├── spreadsheet.ts       # Cell storage
│   └── cell-result-store.ts # Evaluation cache
├── ui/                      # React UI layer
│   ├── components/          # React components
│   │   ├── App.tsx          # Main app component
│   │   ├── Grid.tsx         # Spreadsheet grid
│   │   ├── Cell.tsx         # Individual cell
│   │   ├── FormulaBar.tsx   # Formula input
│   │   └── InfoDisplay.tsx  # Info panel
│   ├── hooks/               # Custom hooks
│   │   └── useKeyboardNavigation.tsx
│   └── SpreadsheetContext.tsx # React context
└── main.tsx                 # React entry point
```

## Key Concepts

### Data Flow

```
User Input → FormulaBar → SpreadsheetContext → Spreadsheet (raw) → EvalEngine → CellResultStore → React Re-render
```

### Architecture Layers

- **Data**: Pure storage (Spreadsheet, CellResultStore)
- **Core**: Business logic (EvalEngine, parsers, evaluators)
- **UI**: React components (App, Grid, Cell, FormulaBar, InfoDisplay)
- **State**: React Context (SpreadsheetContext)
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

1. Add case to `formula-calculator.ts` → `executeFunction()`
2. Write tests in `formula-calculator.test.ts`
3. Update README.md formula list

### Add a New Component

1. Create `.tsx` file in `ui/components/`
2. Use `useSpreadsheet()` hook to access state
3. Export as named or default export
4. Follow existing patterns for consistency

### Add a New Module

1. Place in appropriate layer (`core/`, `data/`, or `ui/`)
2. Import types from `core/types.ts`
3. Maintain separation of concerns

### Refactor Imports

- Search project: `grep -r "from './old-path'" src/`
- Update all occurrences
- Verify: `npm run build`

## Testing Locally

```bash
npm run build          # Check for errors
npm run dev            # Test in browser
```

**React DevTools:**

- Install React DevTools browser extension
- Inspect component tree and props
- View SpreadsheetContext state
- Profile component re-renders

## Important Files

- **tsconfig.json** - TypeScript config (strict mode, unused checks)
- **package.json** - Scripts and dependencies
- **vitest.config.ts** - Test configuration (Vitest)
- **vite.config.ts** - Vite build configuration
- **index.html** - DOM structure (Vite standard: root directory)

## Known Patterns

### React Context Pattern

Components access shared state via context:

```typescript
const { spreadsheet, evalEngine, selectCell, updateCell } = useSpreadsheet();
```

### Custom Hooks

Encapsulate reusable logic:

```typescript
function useKeyboardNavigation(inputRef: RefObject<HTMLInputElement | null>) {
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

Prevent unnecessary re-renders:

```typescript
export const Cell = memo(function Cell({ cellId, row, col }: CellProps) {
  // Component implementation
});
```

### Observer Pattern

Cell changes trigger cascading updates via dependency graph and React re-renders.

## What NOT to Do

❌ Don't add console.log (use debug tools instead)
❌ Don't make properties public without reason
❌ Don't create TODOs (fix or file issue)
❌ Don't skip type annotations
❌ Don't use `any` type unless necessary
❌ Don't import with circular dependencies

## Recent Changes

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
