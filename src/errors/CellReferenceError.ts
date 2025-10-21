export class CellReferenceError extends Error {
  constructor(cellId: string, reason: string) {
    super(`Cell ${cellId} ${reason}`);
    this.name = 'CellReferenceError';
  }
}
