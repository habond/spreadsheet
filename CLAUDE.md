# Claude Context

Quick reference for AI assistants working on this codebase.

## Project Overview

A TypeScript spreadsheet with formula evaluation, dependency tracking, and cycle detection.

**Tech Stack**: TypeScript, Vite, Vanilla JS (no framework)
**Build**: `npm run build` (tsc + vite)
**Dev**: `npm run dev` (live reload on localhost:8080)

## Directory Structure

```
src/
├── core/                    # Business logic
│   ├── evaluation/          # Formula engine
│   │   ├── formula-parser.ts
│   │   ├── formula-evaluator.ts
│   │   └── dependency-graph.ts
│   ├── eval-engine.ts       # Main orchestrator
│   └── types.ts             # Shared types
├── data/                    # Data layer
│   ├── spreadsheet.ts       # Cell storage
│   └── cell-result-store.ts # Evaluation cache
├── ui/                      # UI layer
│   ├── ui-renderer.ts       # DOM manipulation
│   └── event-handlers.ts    # User interactions
└── app.ts                   # Entry point
```

## Key Concepts

### Data Flow
```
User Input → Spreadsheet (raw) → EvalEngine → CellResultStore → UI Update
```

### Architecture Layers
- **Data**: Pure storage (Spreadsheet, CellResultStore)
- **Core**: Business logic (EvalEngine, parsers, evaluators)
- **UI**: DOM & events (UIRenderer, EventHandlers)
- **App**: Wiring & initialization

### Formula Evaluation
1. **Parse**: Tokenize formula string
2. **Evaluate**: Recursive descent parser with operator precedence
3. **Dependencies**: Track cell references, detect cycles
4. **Update**: Topological sort for correct evaluation order

## Code Conventions

### Import Paths
- Use relative paths with layers: `../core/types`, `../data/spreadsheet`
- App.ts uses `.js` extensions for runtime (Vite requirement)

### TypeScript
- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- All types in `core/types.ts`

### Encapsulation
- Private properties with `private` keyword
- Public readonly properties where appropriate
- Controlled access via methods

### File Organization
- One class per file
- Grouped by architectural layer
- Max ~250 lines per file

## Common Tasks

### Add a New Function
1. Add case to `formula-evaluator.ts` → `executeFunction()`
2. Update README.md formula list
3. Test with examples

### Add a New Module
1. Place in appropriate layer (`core/`, `data/`, or `ui/`)
2. Import types from `core/types.ts`
3. Update ARCHITECTURE.md dependency graph

### Refactor Imports
- Search project: `grep -r "from './old-path'" src/`
- Update all occurrences
- Verify: `npm run build`

## Testing Locally

```bash
npm run build          # Check for errors
npm run dev            # Test in browser
```

**Debug Console:**
- `window.spreadsheet` - Raw cell data
- `window.evalEngine` - Evaluation engine
- `window.cellResultStore` - Computed values
- `window.refreshAllCells()` - Force refresh

## Important Files

- **tsconfig.json** - TypeScript config (strict mode, unused checks)
- **package.json** - Scripts and dependencies
- **vite.config.js** - Build configuration (if exists)
- **public/index.html** - DOM structure

## Known Patterns

### Dependency Injection
Components receive dependencies via constructor:
```typescript
constructor(
  private spreadsheet: Spreadsheet,
  private evalEngine: EvalEngine
) {}
```

### Callback Pattern
EvalEngine uses callbacks for data access:
```typescript
new EvalEngine(
  getCellValue: (cellId) => string,
  getCellResult: (cellId) => EvalResult,
  setCellResult: (cellId, result) => void
)
```

### Observer Pattern
Cell changes trigger cascading updates via dependency graph.

## What NOT to Do

❌ Don't add console.log (use debug tools instead)
❌ Don't make properties public without reason
❌ Don't create TODOs (fix or file issue)
❌ Don't skip type annotations
❌ Don't use `any` type unless necessary
❌ Don't import with circular dependencies

## Recent Changes

- Organized into layered directory structure (core/, data/, ui/)
- Removed all unused code (strict TS checks)
- Encapsulated Spreadsheet properties
- Split app.ts into focused modules

## Getting Help

- **README.md** - User documentation, examples
- **ARCHITECTURE.md** - Deep dive on design patterns
- **Code comments** - Inline documentation
- **TypeScript errors** - Run `npm run build` for details
