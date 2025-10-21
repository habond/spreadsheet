export class CircularDependencyError extends Error {
  constructor(cycle: string[]) {
    super(`Circular dependency: ${cycle.join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}
