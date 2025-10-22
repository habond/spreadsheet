/**
 * Utility for translating cell references in formulas relative to position changes.
 *
 * When copying/pasting or filling cells, formulas should adjust their references
 * relative to the new position (like Excel/Google Sheets).
 *
 * Example: If A1 contains "=B1+C1" and is copied to A2, the result is "=B2+C2"
 *
 * This implementation uses AST traversal to ensure we only translate actual
 * cell references, not string literals that happen to look like cell references.
 */

import { parse } from '../parser/formula-parser';
import {
  type ASTNode,
  type BinaryOpNode,
  type CellRefNode,
  type FunctionCallNode,
  isBinaryOpNode,
  isCellRefNode,
  isFunctionCallNode,
  type NumberNode,
  isRangeNode,
  type RangeNode,
  type StringNode,
  isUnaryOpNode,
  type UnaryOpNode,
} from '../types/ast';
import type { CellID, CellPosition } from '../types/core';
import { columnToNumber, numberToColumn } from './column-utils';

/**
 * Translate a single cell reference by a row and column offset
 * @param cellRef - Cell reference like "A1" or "B2"
 * @param rowOffset - Number of rows to shift (positive = down, negative = up)
 * @param colOffset - Number of columns to shift (positive = right, negative = left)
 * @returns Translated cell reference (e.g., "A1" with offset (1, 1) becomes "B2")
 */
export function translateCellRef(cellRef: CellID, rowOffset: number, colOffset: number): CellID {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return cellRef; // Return original if invalid format

  const colLetters = match[1];
  const rowNum = parseInt(match[2], 10);

  // Calculate new position
  const newCol = columnToNumber(colLetters) + colOffset;
  const newRow = rowNum + rowOffset;

  // Validate new position (must be positive)
  if (newCol < 1 || newRow < 1) return cellRef;

  return `${numberToColumn(newCol)}${newRow}`;
}

/**
 * Recursively translate all cell references in an AST node
 * @param node - AST node to translate
 * @param rowOffset - Number of rows to shift
 * @param colOffset - Number of columns to shift
 * @returns New AST node with translated cell references
 */
function translateASTNode(node: ASTNode, rowOffset: number, colOffset: number): ASTNode {
  if (isCellRefNode(node)) {
    // Translate single cell reference
    const translatedCellId = translateCellRef(node.cellId, rowOffset, colOffset);
    return {
      type: 'CellRef',
      cellId: translatedCellId,
    } as CellRefNode;
  }

  if (isRangeNode(node)) {
    // Translate all cells in the range (2D array)
    const translatedCells = node.cells.map(row =>
      row.map(cellId => translateCellRef(cellId, rowOffset, colOffset))
    );
    return {
      type: 'Range',
      cells: translatedCells,
      rows: node.rows,
      cols: node.cols,
    } as RangeNode;
  }

  if (isBinaryOpNode(node)) {
    // Recursively translate left and right operands
    return {
      type: 'BinaryOp',
      operator: node.operator,
      left: translateASTNode(node.left, rowOffset, colOffset),
      right: translateASTNode(node.right, rowOffset, colOffset),
    } as BinaryOpNode;
  }

  if (isUnaryOpNode(node)) {
    // Recursively translate operand
    return {
      type: 'UnaryOp',
      operator: node.operator,
      operand: translateASTNode(node.operand, rowOffset, colOffset),
    } as UnaryOpNode;
  }

  if (isFunctionCallNode(node)) {
    // Recursively translate all function arguments
    return {
      type: 'FunctionCall',
      name: node.name,
      args: node.args.map(arg => translateASTNode(arg, rowOffset, colOffset)),
    } as FunctionCallNode;
  }

  // For Number and String nodes, return unchanged
  return node;
}

/**
 * Convert an AST node back to a formula string
 * @param node - AST node to stringify
 * @returns Formula string representation
 */
function astToFormula(node: ASTNode): string {
  if (isCellRefNode(node)) {
    return node.cellId;
  }

  if (isRangeNode(node)) {
    // Range is represented as firstCell:lastCell
    const firstCell = node.cells[0][0];
    const lastCell = node.cells[node.rows - 1][node.cols - 1];
    return `${firstCell}:${lastCell}`;
  }

  if (node.type === 'Number') {
    return String((node as NumberNode).value);
  }

  if (node.type === 'String') {
    return `"${(node as StringNode).value}"`;
  }

  if (isBinaryOpNode(node)) {
    const left = astToFormula(node.left);
    const right = astToFormula(node.right);
    return `(${left}${node.operator}${right})`;
  }

  if (isUnaryOpNode(node)) {
    const operand = astToFormula(node.operand);
    return `${node.operator}${operand}`;
  }

  if (isFunctionCallNode(node)) {
    const args = node.args.map(arg => astToFormula(arg)).join(', ');
    return `${node.name}(${args})`;
  }

  return '';
}

/**
 * Translate all cell references in a formula by calculating the offset
 * between source and destination positions.
 *
 * Uses AST parsing to ensure only actual cell references are translated,
 * not string literals that happen to look like cell references.
 *
 * @param formula - Original formula (e.g., "=A1+B1" or "=CONCATENATE("B2", A1)")
 * @param sourcePos - Position of the original cell
 * @param destPos - Position of the destination cell
 * @returns Formula with translated cell references (e.g., "=A2+B2")
 */
export function translateFormulaReferences(
  formula: string,
  sourcePos: CellPosition,
  destPos: CellPosition
): string {
  const rowOffset = destPos.row - sourcePos.row;
  const colOffset = destPos.col - sourcePos.col;

  // If no offset, return original formula
  if (rowOffset === 0 && colOffset === 0) return formula;

  // If not a formula, return as-is
  if (!formula.startsWith('=')) return formula;

  try {
    // Parse the formula into an AST (remove the leading '=')
    const ast = parse(formula.slice(1));

    // Translate all cell references in the AST
    const translatedAst = translateASTNode(ast, rowOffset, colOffset);

    // Convert back to formula string
    return '=' + astToFormula(translatedAst);
  } catch {
    // If parsing fails, return original formula unchanged
    return formula;
  }
}
