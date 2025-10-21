export class InvalidFunctionError extends Error {
  constructor(functionName: string) {
    super(`Unknown function: ${functionName}`);
    this.name = 'InvalidFunctionError';
  }
}
