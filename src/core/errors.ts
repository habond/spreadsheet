/**
 * Custom error types for spreadsheet operations
 */

export class CircularDependencyError extends Error {
  constructor(cycle: string[]) {
    super(`Circular dependency: ${cycle.join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}

export class FormulaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaParseError';
  }
}

export class CellReferenceError extends Error {
  constructor(cellId: string, reason: string) {
    super(`Cell ${cellId} ${reason}`);
    this.name = 'CellReferenceError';
  }
}

export class DivisionByZeroError extends Error {
  constructor() {
    super('Division by zero');
    this.name = 'DivisionByZeroError';
  }
}

export class FunctionArgumentError extends Error {
  constructor(functionName: string, message: string) {
    super(`${functionName}: ${message}`);
    this.name = 'FunctionArgumentError';
  }
}

export class InvalidFunctionError extends Error {
  constructor(functionName: string) {
    super(`Unknown function: ${functionName}`);
    this.name = 'InvalidFunctionError';
  }
}
