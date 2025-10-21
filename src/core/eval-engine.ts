import { CellID, GetCellValueFn, GetCellResultFn, SetCellResultFn } from './types';
import { FormulaParser } from './evaluation/formula-parser';
import { FormulaEvaluator } from './evaluation/formula-evaluator';
import { DependencyGraph } from './evaluation/dependency-graph';

export class EvalEngine {
  private getCellValue: GetCellValueFn;
  private setCellResult: SetCellResultFn;
  private dependencyGraph: DependencyGraph;
  private evaluator: FormulaEvaluator;

  constructor(
    getCellValue: GetCellValueFn,
    getCellResult: GetCellResultFn,
    setCellResult: SetCellResultFn
  ) {
    this.getCellValue = getCellValue;
    this.setCellResult = setCellResult;
    this.dependencyGraph = new DependencyGraph();
    this.evaluator = new FormulaEvaluator(getCellResult);
  }

  /**
   * Called when a cell's content changes
   */
  onCellChanged(cellId: CellID, _oldValue: string, newValue: string): void {
    // Extract dependencies from the new value
    const dependencies = this.extractDependencies(newValue);

    // Update the dependency graph
    this.dependencyGraph.updateDependencies(cellId, dependencies);

    // Check for circular dependencies
    const cycle = this.dependencyGraph.detectCycle(cellId);
    if (cycle) {
      const cycleStr = cycle.join(' -> ');
      this.setCellResult(cellId, {
        value: null,
        error: `Circular dependency: ${cycleStr}`
      });
      return;
    }

    // Get all affected cells (this cell and all its dependents)
    const affectedCells = this.dependencyGraph.getAffectedCells(cellId);

    // Evaluate all affected cells in topological order
    for (const cell of affectedCells) {
      this.evaluateCell(cell);
    }
  }

  /**
   * Extract cell dependencies from a value
   */
  private extractDependencies(value: string): Set<CellID> {
    if (!value.startsWith('=')) {
      return new Set();
    }

    const formula = value.substring(1); // Remove the '=' prefix
    return FormulaParser.extractCellReferences(formula);
  }

  /**
   * Evaluate a single cell
   */
  private evaluateCell(cellId: CellID): void {
    const content = this.getCellValue(cellId);

    // Empty cell
    if (!content) {
      this.setCellResult(cellId, { value: '', error: null });
      return;
    }

    // Formula (starts with =)
    if (content.startsWith('=')) {
      const formula = content.substring(1);
      const result = this.evaluator.evaluate(formula);
      this.setCellResult(cellId, result);
      return;
    }

    // Try to parse as number
    const num = parseFloat(content);
    if (!isNaN(num) && content.trim() === String(num)) {
      this.setCellResult(cellId, { value: num, error: null });
      return;
    }

    // Plain text
    this.setCellResult(cellId, { value: content, error: null });
  }
}
