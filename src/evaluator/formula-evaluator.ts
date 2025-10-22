import { parse } from '../parser/formula-parser';
import {
  EvalResult,
  GetCellResultFn,
  CellValue,
  ScalarOrRange,
  ArithmeticOperator,
  ComparisonOperator,
} from '../types/core';
import { CellReferenceError } from '../errors/CellReferenceError';
import { DivisionByZeroError } from '../errors/DivisionByZeroError';
import { FormulaParseError } from '../errors/FormulaParseError';
import { executeFunction } from './functions/function-registry';
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
      let value = this.evaluate(ast);

      // Unwrap 1x1 2D arrays (from single cell references at top level)
      if (Array.isArray(value)) {
        if (value.length === 1 && value[0]?.length === 1 && value[0][0] !== null) {
          value = value[0][0];
        } else {
          throw new FormulaParseError('Ranges cannot be used directly in expressions or comparisons');
        }
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
   * Returns: scalar (number/string) or 2D array for cell refs/ranges
   */
  private evaluate(node: ASTNode): ScalarOrRange {
    // Number literal
    if (isNumberNode(node)) {
      return node.value;
    }

    // String literal
    if (isStringNode(node)) {
      return node.value;
    }

    // Cell reference - return as 1x1 2D array
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
      // Return as 1x1 2D array for consistency
      return [[cellResult.value]];
    }

    // Range reference - return as 2D array
    if (isRangeNode(node)) {
      const values: (number | string | null)[][] = [];
      for (const row of node.cells) {
        const rowValues: (number | string | null)[] = [];
        for (const cellId of row) {
          const cellResult = this.getCellResult(cellId);
          // Preserve structure for 2D ranges - include null for empty/error cells
          // Functions can choose to skip or handle nulls as needed
          if (cellResult && !cellResult.error && cellResult.value !== null) {
            rowValues.push(cellResult.value);
          } else {
            rowValues.push(null);
          }
        }
        values.push(rowValues);
      }
      return values;
    }

    // Binary operation
    if (isBinaryOpNode(node)) {
      let left = this.evaluate(node.left);
      let right = this.evaluate(node.right);

      // Unwrap 1x1 2D arrays (from single cell references)
      left = this.unwrapSingleCell(left);
      right = this.unwrapSingleCell(right);

      // Multi-cell arrays (ranges) can't be used in operations directly
      if (Array.isArray(left) || Array.isArray(right)) {
        throw new FormulaParseError('Ranges cannot be used directly in expressions or comparisons');
      }

      // Arithmetic operators
      const arithmeticOps: ArithmeticOperator[] = ['+', '-', '*', '/'];
      if (arithmeticOps.includes(node.operator as ArithmeticOperator)) {
        const leftNum = this.toNumber(left);
        const rightNum = this.toNumber(right);

        switch (node.operator as ArithmeticOperator) {
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
      const comparisonOps: ComparisonOperator[] = ['=', '<>', '<', '>', '<=', '>='];
      if (comparisonOps.includes(node.operator as ComparisonOperator)) {
        let compResult: boolean;

        switch (node.operator as ComparisonOperator) {
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
        }

        // Return 1 for true, 0 for false (like Excel)
        return compResult ? 1 : 0;
      }

      throw new FormulaParseError(`Unknown operator: ${node.operator}`);
    }

    // Unary operation
    if (isUnaryOpNode(node)) {
      let operand = this.evaluate(node.operand);

      // Unwrap 1x1 2D arrays (from single cell references)
      operand = this.unwrapSingleCell(operand);

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
      // Functions now receive 2D arrays directly - no flattening
      return executeFunction(node.name, args);
    }

    throw new FormulaParseError(`Unknown AST node type: ${(node as ASTNode).type}`);
  }

  /**
   * Unwrap a 1x1 2D array (from single cell reference) back to scalar
   * Returns the value as-is if it's not a 1x1 array
   */
  private unwrapSingleCell(value: ScalarOrRange): ScalarOrRange {
    if (Array.isArray(value) && value.length === 1 && value[0]?.length === 1 && value[0][0] !== null) {
      return value[0][0];
    }
    return value;
  }

  /**
   * Convert a value to a number (helper for expression evaluation)
   */
  private toNumber(value: CellValue): number {
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
