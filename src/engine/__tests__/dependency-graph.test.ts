import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraph } from '../dependency-graph';

describe('DependencyGraph', () => {
  let graph: DependencyGraph;

  beforeEach(() => {
    graph = new DependencyGraph();
  });

  describe('updateDependencies', () => {
    it('should update dependencies for a cell', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1']));

      const deps = graph.getDependencies('A1');
      expect(deps).toEqual(new Set(['B1', 'C1']));
    });

    it('should update reverse dependencies', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1']));

      expect(graph.getDependents('B1')).toEqual(new Set(['A1']));
      expect(graph.getDependents('C1')).toEqual(new Set(['A1']));
    });

    it('should replace old dependencies', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1']));
      graph.updateDependencies('A1', new Set(['D1']));

      const deps = graph.getDependencies('A1');
      expect(deps).toEqual(new Set(['D1']));

      expect(graph.getDependents('B1')).toEqual(new Set());
      expect(graph.getDependents('C1')).toEqual(new Set());
      expect(graph.getDependents('D1')).toEqual(new Set(['A1']));
    });

    it('should handle empty dependencies', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('A1', new Set());

      expect(graph.getDependencies('A1')).toEqual(new Set());
      expect(graph.getDependents('B1')).toEqual(new Set());
    });

    it('should handle multiple cells depending on same cell', () => {
      graph.updateDependencies('A1', new Set(['C1']));
      graph.updateDependencies('B1', new Set(['C1']));

      expect(graph.getDependents('C1')).toEqual(new Set(['A1', 'B1']));
    });
  });

  describe('getDependencies', () => {
    it('should return empty set for cell with no dependencies', () => {
      const deps = graph.getDependencies('A1');
      expect(deps).toEqual(new Set());
    });

    it('should return dependencies for a cell', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1', 'D1']));

      const deps = graph.getDependencies('A1');
      expect(deps).toEqual(new Set(['B1', 'C1', 'D1']));
    });
  });

  describe('getDependents', () => {
    it('should return empty set for cell with no dependents', () => {
      const dependents = graph.getDependents('A1');
      expect(dependents).toEqual(new Set());
    });

    it('should return all cells that depend on a given cell', () => {
      graph.updateDependencies('A1', new Set(['C1']));
      graph.updateDependencies('B1', new Set(['C1']));

      const dependents = graph.getDependents('C1');
      expect(dependents).toEqual(new Set(['A1', 'B1']));
    });
  });

  describe('detectCycle', () => {
    it('should return null when no cycle exists', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('B1', new Set(['C1']));

      const cycle = graph.detectCycle('A1');
      expect(cycle).toBeNull();
    });

    it('should detect direct self-reference', () => {
      graph.updateDependencies('A1', new Set(['A1']));

      const cycle = graph.detectCycle('A1');
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('A1');
    });

    it('should detect two-cell cycle', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('B1', new Set(['A1']));

      const cycle = graph.detectCycle('A1');
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('A1');
      expect(cycle).toContain('B1');
    });

    it('should detect three-cell cycle', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('B1', new Set(['C1']));
      graph.updateDependencies('C1', new Set(['A1']));

      const cycle = graph.detectCycle('A1');
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('A1');
      expect(cycle).toContain('B1');
      expect(cycle).toContain('C1');
    });

    it('should detect cycle in complex graph', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1']));
      graph.updateDependencies('B1', new Set(['D1']));
      graph.updateDependencies('C1', new Set(['E1']));
      graph.updateDependencies('D1', new Set(['F1']));
      graph.updateDependencies('E1', new Set(['F1']));
      graph.updateDependencies('F1', new Set(['B1'])); // Creates cycle: B1 -> D1 -> F1 -> B1

      const cycle = graph.detectCycle('A1');
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('B1');
      expect(cycle).toContain('D1');
      expect(cycle).toContain('F1');
    });

    it('should not detect cycle when starting from non-cyclic branch', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('B1', new Set(['C1']));
      graph.updateDependencies('D1', new Set(['E1']));
      graph.updateDependencies('E1', new Set(['D1'])); // Cycle exists but not reachable from A1

      const cycle = graph.detectCycle('A1');
      expect(cycle).toBeNull();
    });
  });

  describe('getAffectedCells', () => {
    it('should return only the cell itself when it has no dependents', () => {
      const affected = graph.getAffectedCells('A1');
      expect(affected).toEqual(['A1']);
    });

    it('should return cell and its direct dependents', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['A1']));

      const affected = graph.getAffectedCells('A1');
      expect(affected).toContain('A1');
      expect(affected).toContain('B1');
      expect(affected).toContain('C1');
      expect(affected.length).toBe(3);
    });

    it('should return cells in topological order (dependencies before dependents)', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['B1']));

      const affected = graph.getAffectedCells('A1');
      expect(affected).toEqual(['A1', 'B1', 'C1']);
    });

    it('should handle complex dependency chains', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['A1']));
      graph.updateDependencies('D1', new Set(['B1', 'C1']));

      const affected = graph.getAffectedCells('A1');
      expect(affected).toContain('A1');
      expect(affected).toContain('B1');
      expect(affected).toContain('C1');
      expect(affected).toContain('D1');
      expect(affected.length).toBe(4);

      // D1 should come after B1 and C1
      const indexB1 = affected.indexOf('B1');
      const indexC1 = affected.indexOf('C1');
      const indexD1 = affected.indexOf('D1');
      expect(indexD1).toBeGreaterThan(indexB1);
      expect(indexD1).toBeGreaterThan(indexC1);
    });

    it('should handle diamond dependency pattern', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['A1']));
      graph.updateDependencies('D1', new Set(['B1', 'C1']));

      const affected = graph.getAffectedCells('A1');

      const indexA1 = affected.indexOf('A1');
      const indexB1 = affected.indexOf('B1');
      const indexC1 = affected.indexOf('C1');
      const indexD1 = affected.indexOf('D1');

      // A1 should be first
      expect(indexA1).toBe(0);
      // B1 and C1 should come after A1
      expect(indexB1).toBeGreaterThan(indexA1);
      expect(indexC1).toBeGreaterThan(indexA1);
      // D1 should come after both B1 and C1
      expect(indexD1).toBeGreaterThan(indexB1);
      expect(indexD1).toBeGreaterThan(indexC1);
    });

    it('should not include cells outside the dependency tree', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['D1'])); // Separate dependency tree

      const affected = graph.getAffectedCells('A1');
      expect(affected).toContain('A1');
      expect(affected).toContain('B1');
      expect(affected).not.toContain('C1');
      expect(affected).not.toContain('D1');
    });

    it('should handle multiple levels of dependencies', () => {
      graph.updateDependencies('B1', new Set(['A1']));
      graph.updateDependencies('C1', new Set(['B1']));
      graph.updateDependencies('D1', new Set(['C1']));
      graph.updateDependencies('E1', new Set(['D1']));

      const affected = graph.getAffectedCells('A1');
      expect(affected).toEqual(['A1', 'B1', 'C1', 'D1', 'E1']);
    });
  });

  describe('complex scenarios', () => {
    it('should handle a cell being updated multiple times', () => {
      graph.updateDependencies('A1', new Set(['B1']));
      graph.updateDependencies('A1', new Set(['C1']));
      graph.updateDependencies('A1', new Set(['D1']));

      expect(graph.getDependencies('A1')).toEqual(new Set(['D1']));
      expect(graph.getDependents('B1')).toEqual(new Set());
      expect(graph.getDependents('C1')).toEqual(new Set());
      expect(graph.getDependents('D1')).toEqual(new Set(['A1']));
    });

    it('should handle large dependency graph', () => {
      for (let i = 1; i <= 10; i++) {
        graph.updateDependencies(`A${i + 1}`, new Set([`A${i}`]));
      }

      const affected = graph.getAffectedCells('A1');
      expect(affected.length).toBe(11);
      expect(affected[0]).toBe('A1');
      expect(affected[10]).toBe('A11');
    });

    it('should handle clearing all dependencies', () => {
      graph.updateDependencies('A1', new Set(['B1', 'C1']));
      graph.updateDependencies('B1', new Set(['D1']));

      graph.updateDependencies('A1', new Set());
      graph.updateDependencies('B1', new Set());

      expect(graph.getDependencies('A1')).toEqual(new Set());
      expect(graph.getDependents('B1')).toEqual(new Set());
      expect(graph.getDependents('C1')).toEqual(new Set());
      expect(graph.getDependents('D1')).toEqual(new Set());
    });
  });
});
