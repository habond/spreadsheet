# Architecture Overview

This document describes the modular architecture of the spreadsheet application.

## Module Structure

The application is organized into focused, single-responsibility modules grouped by architectural layer:

```
src/
├── core/                           # Core business logic
│   ├── evaluation/                 # Formula evaluation engine
│   │   ├── formula-parser.ts       (111 lines) - Tokenization & cell reference extraction
│   │   ├── formula-evaluator.ts    (254 lines) - Expression evaluation with precedence
│   │   └── dependency-graph.ts     (117 lines) - Dependency tracking & cycle detection
│   ├── eval-engine.ts              (95 lines)  - Evaluation orchestration
│   └── types.ts                    (14 lines)  - Shared type definitions
├── data/                           # Data storage layer
│   ├── spreadsheet.ts              (145 lines) - Cell data storage & navigation
│   └── cell-result-store.ts        (50 lines)  - Evaluation result management
├── ui/                             # User interface layer
│   ├── ui-renderer.ts              (175 lines) - DOM manipulation & rendering
│   └── event-handlers.ts           (157 lines) - User interaction handlers
└── app.ts                          (69 lines)  - Application initialization
```

## Dependency Graph

```
app.ts
├── data/spreadsheet.ts
│   └── core/types.ts
├── data/cell-result-store.ts
│   └── core/types.ts
├── core/eval-engine.ts
│   ├── core/types.ts
│   ├── core/evaluation/formula-parser.ts
│   │   └── core/types.ts
│   ├── core/evaluation/formula-evaluator.ts
│   │   ├── core/types.ts
│   │   └── core/evaluation/formula-parser.ts
│   └── core/evaluation/dependency-graph.ts
│       └── core/types.ts
├── ui/ui-renderer.ts
│   ├── core/types.ts
│   ├── data/spreadsheet.ts
│   └── data/cell-result-store.ts
└── ui/event-handlers.ts
    ├── data/spreadsheet.ts
    ├── core/eval-engine.ts
    └── ui/ui-renderer.ts
```

## Module Responsibilities

### Core Layer (`core/`)

**core/types.ts** - Central type definitions
- `CellID` - Type alias for cell identifiers
- `EvalResult` - Evaluation result structure (value + error)
- Function type definitions for callbacks

**core/eval-engine.ts** - Main orchestrator
- Coordinates parsing, evaluation, and dependency tracking
- Handles cell change events
- Automatically re-evaluates dependent cells
- Manages error states

**core/evaluation/formula-parser.ts** - Lexical analysis
- Tokenizes formula strings
- Extracts cell references from formulas
- Identifies numbers, operators, functions, and cell references

**core/evaluation/formula-evaluator.ts** - Semantic analysis & execution
- Recursive descent parser with operator precedence
- Evaluates arithmetic expressions (+, -, *, /)
- Executes built-in functions (SUM, AVG, MIN, MAX, etc.)
- Handles type coercion and error propagation

**core/evaluation/dependency-graph.ts** - Dependency management
- Tracks forward dependencies (what a cell depends on)
- Tracks reverse dependencies (what depends on a cell)
- Detects circular references using DFS
- Provides topological sorting for evaluation order

### Data Layer (`data/`)

**data/spreadsheet.ts** - Data model for the spreadsheet
- Stores raw cell content (what the user typed)
- Manages cell selection state
- Provides cell navigation (up, down, left, right)
- Converts between cell IDs and row/column indices
- **Encapsulation**: `cells` and `selectedCell` are private

**data/cell-result-store.ts** - Manages evaluation results
- Stores computed values and errors for each cell
- Provides convenience methods for display values
- Separates raw content from computed results

### UI Layer (`ui/`)

**ui/ui-renderer.ts** - DOM manipulation
- Creates and updates DOM elements
- Renders cell values and error states
- Updates the formula bar and info display
- Manages visual selection state

**ui/event-handlers.ts** - User interaction
- Handles cell click events
- Manages formula input submission
- Implements keyboard navigation (arrows, Enter, Tab)
- Coordinates between spreadsheet model and UI

### Application Layer

**app.ts** - Application entry point
- Initializes all components
- Wires up dependencies
- Exposes debugging interface
- Minimal orchestration logic (69 lines!)

## Data Flow

### User Input Flow
```
User types in formula bar
    ↓
EventHandlers.handleFormulaSubmit()
    ↓
Spreadsheet.setCellContent() - stores raw content
    ↓
EvalEngine.onCellChanged()
    ├── Extract dependencies (FormulaParser)
    ├── Update dependency graph
    ├── Detect cycles
    └── Evaluate affected cells
        ├── FormulaEvaluator.evaluate()
        └── CellResultStore.set()
            └── UIRenderer.updateCellDisplay()
```

### Cell Evaluation Flow
```
EvalEngine.evaluateCell()
    ↓
Is it a formula? (starts with '=')
    YES → FormulaEvaluator.evaluate()
        ├── Tokenize (FormulaParser)
        ├── Parse expression with precedence
        ├── Resolve cell references (via getCellResult callback)
        └── Execute functions
    NO → Is it a number?
        YES → Parse as number
        NO → Store as text
    ↓
CellResultStore.set() + UIRenderer.updateCellDisplay()
```

## Design Patterns

### Separation of Concerns
- **Data**: Spreadsheet, CellResultStore
- **Business Logic**: EvalEngine, FormulaParser, FormulaEvaluator, DependencyGraph
- **UI**: UIRenderer
- **Interaction**: EventHandlers
- **Orchestration**: app.ts

### Dependency Injection
- EvalEngine receives callbacks for data access (getCellValue, getCellResult, setCellResult)
- FormulaEvaluator receives getCellResult callback
- UIRenderer receives Spreadsheet and CellResultStore
- EventHandlers receives all needed components

### Single Responsibility
Each module has ONE clear purpose:
- FormulaParser: Tokenization only
- FormulaEvaluator: Evaluation only
- DependencyGraph: Dependency tracking only
- UIRenderer: DOM manipulation only
- EventHandlers: Event handling only

### Encapsulation
- Spreadsheet: `cells` and `selectedCell` are private
- CellResultStore: `results` is private
- DependencyGraph: `dependencies` and `dependents` are private
- All modules expose minimal public APIs

## Benefits of This Architecture

1. **Modularity**: Each module can be tested independently
2. **Maintainability**: Clear responsibilities make changes easier
3. **Reusability**: Core modules (parser, evaluator) could be reused
4. **Testability**: Pure functions and dependency injection
5. **Scalability**: Easy to add new functions or features
6. **Readability**: Small, focused files are easier to understand

## Potential Future Improvements

### Feature Additions
- Cell ranges (A1:A10)
- More functions (IF, VLOOKUP, etc.)
- Multiple sheets
- Undo/redo functionality

### Architecture Enhancements
- Add unit tests for each module
- Implement a proper event bus for loose coupling
- Add a command pattern for undo/redo
- Consider React/Vue for reactive UI updates
- Add Web Workers for heavy calculations
