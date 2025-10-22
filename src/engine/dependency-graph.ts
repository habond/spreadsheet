import type { CellID } from '../types/core';

/**
 * Tracks cell dependencies in both directions (forward and reverse).
 *
 * Forward dependencies: which cells does this cell depend on?
 * Reverse dependencies: which cells depend on this cell?
 *
 * Used by EvalEngine to determine evaluation order and detect circular references.
 */
export class DependencyGraph {
  // Maps a cell to the cells it depends on (forward dependencies)
  private dependencies: Map<CellID, Set<CellID>> = new Map();

  // Maps a cell to the cells that depend on it (reverse dependencies)
  private dependents: Map<CellID, Set<CellID>> = new Map();

  /**
   * Update dependencies for a cell
   */
  updateDependencies(cellId: CellID, newDeps: Set<CellID>): void {
    const oldDeps = this.dependencies.get(cellId) || new Set();

    // Remove old reverse dependencies
    for (const dep of oldDeps) {
      const reverseDeps = this.dependents.get(dep);
      if (reverseDeps) {
        reverseDeps.delete(cellId);
      }
    }

    // Add new dependencies
    this.dependencies.set(cellId, newDeps);

    // Add new reverse dependencies
    for (const dep of newDeps) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set());
      }
      const dependentSet = this.dependents.get(dep);
      if (dependentSet) {
        dependentSet.add(cellId);
      }
    }
  }

  /**
   * Get all cells that depend on the given cell
   */
  getDependents(cellId: CellID): Set<CellID> {
    return this.dependents.get(cellId) || new Set();
  }

  /**
   * Get all cells that the given cell depends on
   */
  getDependencies(cellId: CellID): Set<CellID> {
    return this.dependencies.get(cellId) || new Set();
  }

  /**
   * Detect if there's a circular dependency starting from a cell
   */
  detectCycle(startCell: CellID): CellID[] | null {
    const visited = new Set<CellID>();
    const recStack = new Set<CellID>();
    const path: CellID[] = [];

    const dfs = (cell: CellID): boolean => {
      visited.add(cell);
      recStack.add(cell);
      path.push(cell);

      const deps = this.getDependencies(cell);
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) {
            return true;
          }
        } else if (recStack.has(dep)) {
          // Found a cycle
          path.push(dep);
          return true;
        }
      }

      recStack.delete(cell);
      path.pop();
      return false;
    };

    if (dfs(startCell)) {
      return path;
    }

    return null;
  }

  /**
   * Get all cells that need to be re-evaluated when a cell changes
   * Returns cells in topological order (dependencies first)
   */
  getAffectedCells(cellId: CellID): CellID[] {
    const result: CellID[] = [];
    const visited = new Set<CellID>();

    const dfs = (cell: CellID): void => {
      if (visited.has(cell)) {
        return;
      }
      visited.add(cell);

      // Visit all dependents first
      const dependents = this.getDependents(cell);
      for (const dependent of dependents) {
        dfs(dependent);
      }

      // Then add this cell
      result.push(cell);
    };

    dfs(cellId);

    // Reverse to get topological order (dependencies before dependents)
    return result.reverse();
  }
}
