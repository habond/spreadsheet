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
import type { Axis, CellGrid, CellID, CellPosition } from '../types/core';
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
    return `${left}${node.operator}${right}`;
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

/**
 * Translate a single cell reference for insert operations.
 * Only shifts the reference if it points to a column/row at or after the insertion point.
 *
 * @param cellRef - Cell reference like "A1" or "B2"
 * @param axis - 'column' or 'row' - which axis is being inserted
 * @param insertIndex - Index where insertion happened (0-based)
 * @returns Translated cell reference, or original if it shouldn't be shifted
 */
function translateCellRefForInsert(cellRef: CellID, axis: Axis, insertIndex: number): CellID {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return cellRef; // Return original if invalid format

  const colLetters = match[1];
  const rowNum = parseInt(match[2], 10);
  const colNum = columnToNumber(colLetters);

  let newCol = colNum;
  let newRow = rowNum;

  // If inserting a column and this reference is at or after the insertion point, shift it right
  if (axis === 'column' && colNum >= insertIndex + 1) {
    // insertIndex is 0-based, colNum is 1-based
    // Example: insertIndex=1 (inserting at B), colNum=2 (B) should shift
    newCol = colNum + 1;
  }

  // If inserting a row and this reference is at or after the insertion point, shift it down
  if (axis === 'row' && rowNum >= insertIndex + 1) {
    // insertIndex is 0-based, rowNum is 1-based
    // Example: insertIndex=1 (inserting at row 2), rowNum=2 (row 2) should shift
    newRow = rowNum + 1;
  }

  // If nothing changed, return original
  if (newCol === colNum && newRow === rowNum) {
    return cellRef;
  }

  return `${numberToColumn(newCol)}${newRow}`;
}

/**
 * Recursively translate cell references in an AST for insert operations.
 * Only shifts references that point to columns/rows at or after the insertion point.
 *
 * @param node - AST node to translate
 * @param axis - 'column' or 'row' - which axis is being inserted
 * @param insertIndex - Index where insertion happened (0-based)
 * @returns New AST node with selectively translated cell references
 */
function translateASTNodeForInsert(node: ASTNode, axis: Axis, insertIndex: number): ASTNode {
  if (isCellRefNode(node)) {
    // Translate single cell reference (only if it's at/after insertion point)
    const translatedCellId = translateCellRefForInsert(node.cellId, axis, insertIndex);
    return {
      type: 'CellRef',
      cellId: translatedCellId,
    } as CellRefNode;
  }

  if (isRangeNode(node)) {
    // Translate all cells in the range (2D array)
    const translatedCells = node.cells.map(row =>
      row.map(cellId => translateCellRefForInsert(cellId, axis, insertIndex))
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
      left: translateASTNodeForInsert(node.left, axis, insertIndex),
      right: translateASTNodeForInsert(node.right, axis, insertIndex),
    } as BinaryOpNode;
  }

  if (isUnaryOpNode(node)) {
    // Recursively translate operand
    return {
      type: 'UnaryOp',
      operator: node.operator,
      operand: translateASTNodeForInsert(node.operand, axis, insertIndex),
    } as UnaryOpNode;
  }

  if (isFunctionCallNode(node)) {
    // Recursively translate all function arguments
    return {
      type: 'FunctionCall',
      name: node.name,
      args: node.args.map(arg => translateASTNodeForInsert(arg, axis, insertIndex)),
    } as FunctionCallNode;
  }

  // For Number and String nodes, return unchanged
  return node;
}

/**
 * Translate cell references in a formula for insert column/row operations.
 * Only shifts references that point to cells at or after the insertion point.
 *
 * @param formula - Original formula (e.g., "=A1+B1")
 * @param axis - 'column' or 'row' - which axis is being inserted
 * @param insertIndex - Index where insertion happened (0-based)
 * @returns Formula with selectively translated cell references
 */
export function translateFormulaReferencesForInsert(
  formula: string,
  axis: Axis,
  insertIndex: number
): string {
  // If not a formula, return as-is
  if (!formula.startsWith('=')) return formula;

  try {
    // Parse the formula into an AST (remove the leading '=')
    const ast = parse(formula.slice(1));

    // Translate only affected cell references in the AST
    const translatedAst = translateASTNodeForInsert(ast, axis, insertIndex);

    // Convert back to formula string
    return '=' + astToFormula(translatedAst);
  } catch {
    // If parsing fails, return original formula unchanged
    return formula;
  }
}

/**
 * Translate a single cell reference for delete operations.
 * - References TO the deleted column/row become #REF! errors
 * - References AFTER the deleted column/row shift left/up
 *
 * @param cellRef - Cell reference like "A1" or "B2"
 * @param axis - 'column' or 'row' - which axis is being deleted
 * @param deleteIndex - Index of deleted column/row (0-based)
 * @returns Translated cell reference, #REF! for deleted references, or original if before deletion
 */
function translateCellRefForDelete(cellRef: CellID, axis: Axis, deleteIndex: number): CellID {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return cellRef; // Return original if invalid format

  const colLetters = match[1];
  const rowNum = parseInt(match[2], 10);
  const colNum = columnToNumber(colLetters);

  let newCol = colNum;
  let newRow = rowNum;

  // If deleting a column
  if (axis === 'column') {
    // deleteIndex is 0-based, colNum is 1-based
    if (colNum === deleteIndex + 1) {
      // Reference TO the deleted column becomes #REF!
      return '#REF!';
    } else if (colNum > deleteIndex + 1) {
      // References AFTER the deleted column shift left
      newCol = colNum - 1;
    }
  }

  // If deleting a row
  if (axis === 'row') {
    // deleteIndex is 0-based, rowNum is 1-based
    if (rowNum === deleteIndex + 1) {
      // Reference TO the deleted row becomes #REF!
      return '#REF!';
    } else if (rowNum > deleteIndex + 1) {
      // References AFTER the deleted row shift up
      newRow = rowNum - 1;
    }
  }

  // If nothing changed, return original
  if (newCol === colNum && newRow === rowNum) {
    return cellRef;
  }

  return `${numberToColumn(newCol)}${newRow}`;
}

/**
 * Recursively translate cell references in an AST for delete operations.
 * - References TO deleted column/row become error strings
 * - References AFTER deleted column/row shift left/up
 *
 * @param node - AST node to translate
 * @param axis - 'column' or 'row' - which axis is being deleted
 * @param deleteIndex - Index of deleted column/row (0-based)
 * @returns Translated AST node
 */
function translateASTNodeForDelete(node: ASTNode, axis: Axis, deleteIndex: number): ASTNode {
  if (isCellRefNode(node)) {
    const translatedRef = translateCellRefForDelete(node.cellId, axis, deleteIndex);
    // Keep #REF! as a CellRef node so it serializes without quotes
    return { type: 'CellRef', cellId: translatedRef } as CellRefNode;
  }

  if (isRangeNode(node)) {
    // For ranges, only translate the endpoints (top-left and bottom-right)
    // Get the first and last cells to determine the range boundaries
    const topLeft = node.cells[0][0];
    const bottomRight = node.cells[node.rows - 1][node.cols - 1];

    const translatedTopLeft = translateCellRefForDelete(topLeft, axis, deleteIndex);
    const translatedBottomRight = translateCellRefForDelete(bottomRight, axis, deleteIndex);

    // If either endpoint is deleted, the entire range becomes #REF!
    if (translatedTopLeft === '#REF!' || translatedBottomRight === '#REF!') {
      return { type: 'CellRef', cellId: '#REF!' } as CellRefNode;
    }

    // Reconstruct the range with translated endpoints
    // Parse the translated cells to rebuild the grid
    const match1 = translatedTopLeft.match(/^([A-Z]+)(\d+)$/);
    const match2 = translatedBottomRight.match(/^([A-Z]+)(\d+)$/);

    if (!match1 || !match2) {
      return { type: 'CellRef', cellId: '#REF!' } as CellRefNode;
    }

    const startCol = columnToNumber(match1[1]);
    const startRow = parseInt(match1[2], 10);
    const endCol = columnToNumber(match2[1]);
    const endRow = parseInt(match2[2], 10);

    // Rebuild the cells grid
    const translatedGrid: CellGrid = [];
    for (let row = startRow; row <= endRow; row++) {
      const rowCells: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        rowCells.push(`${numberToColumn(col)}${row}`);
      }
      translatedGrid.push(rowCells);
    }

    return {
      type: 'Range',
      cells: translatedGrid,
      rows: translatedGrid.length,
      cols: translatedGrid[0]?.length || 0,
    } as RangeNode;
  }

  if (isBinaryOpNode(node)) {
    // Recursively translate both operands
    return {
      type: 'BinaryOp',
      operator: node.operator,
      left: translateASTNodeForDelete(node.left, axis, deleteIndex),
      right: translateASTNodeForDelete(node.right, axis, deleteIndex),
    } as BinaryOpNode;
  }

  if (isUnaryOpNode(node)) {
    // Recursively translate operand
    return {
      type: 'UnaryOp',
      operator: node.operator,
      operand: translateASTNodeForDelete(node.operand, axis, deleteIndex),
    } as UnaryOpNode;
  }

  if (isFunctionCallNode(node)) {
    // Recursively translate all function arguments
    return {
      type: 'FunctionCall',
      name: node.name,
      args: node.args.map(arg => translateASTNodeForDelete(arg, axis, deleteIndex)),
    } as FunctionCallNode;
  }

  // For Number and String nodes, return unchanged
  return node;
}

/**
 * Translate cell references in a formula for delete column/row operations.
 * - References TO deleted column/row become #REF! errors
 * - References AFTER deleted column/row shift left/up
 *
 * @param formula - Original formula (e.g., "=A1+B1")
 * @param axis - 'column' or 'row' - which axis is being deleted
 * @param deleteIndex - Index of deleted column/row (0-based)
 * @returns Formula with translated cell references (may contain #REF! errors)
 */
export function translateFormulaReferencesForDelete(
  formula: string,
  axis: Axis,
  deleteIndex: number
): string {
  // If not a formula, return as-is
  if (!formula.startsWith('=')) return formula;

  try {
    // Parse the formula into an AST (remove the leading '=')
    const ast = parse(formula.slice(1));

    // Translate cell references in the AST
    const translatedAst = translateASTNodeForDelete(ast, axis, deleteIndex);

    // Convert back to formula string
    return '=' + astToFormula(translatedAst);
  } catch {
    // If parsing fails, return original formula unchanged
    return formula;
  }
}
