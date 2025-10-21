import { parse } from '../parser/formula-parser';
import { EvalResult, GetCellResultFn } from '../types/core';
import { CellReferenceError } from '../errors/CellReferenceError';
import { DivisionByZeroError } from '../errors/DivisionByZeroError';
import { FormulaParseError } from '../errors/FormulaParseError';
import { executeFunction, flattenArgs } from './functions/function-registry';
import {
  ASTNode,
  isNumberNode,
  isStringNode,
  isCellRefNode,
  isRangeNode,
  isBinaryOpNode,
  isUnaryOpNode,
  isFunctionCallNode,
} from '../types/ast';

// Re-export for backwards compatibility
export { FunctionName, SUPPORTED_FUNCTIONS } from './functions/function-registry';

/**
 * Computes formula expressions by evaluating an AST.
 * Does NOT orchestrate cell evaluation - that's handled by EvalEngine.
 * Cell references are resolved from already-computed results to prevent
 * infinite loops and ensure correct topological evaluation order.
 */
export class FormulaCalculator {
  private getCellResult: GetCellResultFn;

  constructor(getCellResult: GetCellResultFn) {
    this.getCellResult = getCellResult;
  }

  /**
   * Calculate a formula and return the result.
   * Parses the formula into an AST and evaluates it.
   * Assumes all referenced cells are already evaluated.
   */
  calculate(formula: string): EvalResult {
    try {
      const ast = parse(formula);
      const value = this.evaluate(ast);

      // Ranges should never escape to the top level (should only be consumed by functions)
      if (Array.isArray(value)) {
        throw new FormulaParseError('Ranges cannot be used directly in expressions or comparisons');
      }

      return { value, error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Evaluate an AST node and return its value
   */
  private evaluate(node: ASTNode): number | string | (number | string)[] {
    // Number literal
    if (isNumberNode(node)) {
      return node.value;
    }

    // String literal
    if (isStringNode(node)) {
      return node.value;
    }

    // Cell reference
    if (isCellRefNode(node)) {
      const cellResult = this.getCellResult(node.cellId);
      if (!cellResult) {
        throw new CellReferenceError(node.cellId, 'has no value');
      }
      if (cellResult.error) {
        throw new CellReferenceError(node.cellId, `has error: ${cellResult.error}`);
      }
      if (cellResult.value === null) {
        throw new CellReferenceError(node.cellId, 'has no value');
      }
      return cellResult.value;
    }

    // Range reference
    if (isRangeNode(node)) {
      const values: (number | string)[] = [];
      for (const cellId of node.cells) {
        const cellResult = this.getCellResult(cellId);
        // Skip empty cells in ranges (they don't contribute to calculations)
        if (cellResult && !cellResult.error && cellResult.value !== null) {
          values.push(cellResult.value);
        }
      }
      return values;
    }

    // Binary operation
    if (isBinaryOpNode(node)) {
      const left = this.evaluate(node.left);
      const right = this.evaluate(node.right);

      // Arrays (from ranges) can't be used in operations directly
      if (Array.isArray(left) || Array.isArray(right)) {
        throw new FormulaParseError('Ranges cannot be used directly in expressions or comparisons');
      }

      // Arithmetic operators
      if (['+', '-', '*', '/'].includes(node.operator)) {
        const leftNum = this.toNumber(left);
        const rightNum = this.toNumber(right);

        switch (node.operator) {
          case '+':
            return leftNum + rightNum;
          case '-':
            return leftNum - rightNum;
          case '*':
            return leftNum * rightNum;
          case '/':
            if (rightNum === 0) {
              throw new DivisionByZeroError();
            }
            return leftNum / rightNum;
        }
      }

      // Comparison operators
      if (['=', '<>', '<', '>', '<=', '>='].includes(node.operator)) {
        let compResult: boolean;

        switch (node.operator) {
          case '=':
            compResult = left === right;
            break;
          case '<>':
            compResult = left !== right;
            break;
          case '<':
            compResult = this.toNumber(left) < this.toNumber(right);
            break;
          case '>':
            compResult = this.toNumber(left) > this.toNumber(right);
            break;
          case '<=':
            compResult = this.toNumber(left) <= this.toNumber(right);
            break;
          case '>=':
            compResult = this.toNumber(left) >= this.toNumber(right);
            break;
          default:
            throw new FormulaParseError(`Unknown comparison operator: ${node.operator}`);
        }

        // Return 1 for true, 0 for false (like Excel)
        return compResult ? 1 : 0;
      }

      throw new FormulaParseError(`Unknown operator: ${node.operator}`);
    }

    // Unary operation
    if (isUnaryOpNode(node)) {
      const operand = this.evaluate(node.operand);

      if (Array.isArray(operand)) {
        throw new FormulaParseError('Ranges cannot be used directly in expressions or comparisons');
      }

      if (node.operator === '-') {
        return -this.toNumber(operand);
      }

      throw new FormulaParseError(`Unknown unary operator: ${node.operator}`);
    }

    // Function call
    if (isFunctionCallNode(node)) {
      const args = node.args.map(arg => this.evaluate(arg));
      const flattenedArgs = flattenArgs(args);
      return executeFunction(node.name, flattenedArgs);
    }

    throw new FormulaParseError(`Unknown AST node type: ${(node as ASTNode).type}`);
  }

  /**
   * Convert a value to a number (helper for expression evaluation)
   */
  private toNumber(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }
    const num = parseFloat(String(value));
    if (isNaN(num)) {
      throw new FormulaParseError(`Cannot convert '${value}' to number`);
    }
    return num;
  }
}
