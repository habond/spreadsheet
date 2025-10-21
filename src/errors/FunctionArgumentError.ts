export class FunctionArgumentError extends Error {
  constructor(functionName: string, message: string) {
    super(`${functionName}: ${message}`);
    this.name = 'FunctionArgumentError';
  }
}
