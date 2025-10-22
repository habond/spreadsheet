/**
 * Abstract Syntax Tree (AST) node types for formula parsing.
 *
 * The AST represents the hierarchical structure of a formula expression,
 * separating parsing from evaluation.
 */

import { CellGrid } from './core';

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
  type: string;
}

/**
 * Literal number value (e.g., 42, 3.14)
 */
export interface NumberNode extends ASTNode {
  type: 'Number';
  value: number;
}

/**
 * Literal string value (e.g., "hello")
 */
export interface StringNode extends ASTNode {
  type: 'String';
  value: string;
}

/**
 * Cell reference (e.g., A1, B5)
 * Represented as a 1x1 2D array for consistency with ranges
 */
export interface CellRefNode extends ASTNode {
  type: 'CellRef';
  cellId: string;
}

/**
 * Range reference (e.g., A1:B3)
 * Stored as a 2D array in row-major order
 * Example: A1:C2 → [["A1", "B1", "C1"], ["A2", "B2", "C2"]]
 */
export interface RangeNode extends ASTNode {
  type: 'Range';
  cells: CellGrid; // 2D array: rows of columns
  rows: number; // Number of rows
  cols: number; // Number of columns
}

/**
 * Binary operation (e.g., +, -, *, /, >, <, =)
 */
export interface BinaryOpNode extends ASTNode {
  type: 'BinaryOp';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

/**
 * Unary operation (e.g., -5)
 */
export interface UnaryOpNode extends ASTNode {
  type: 'UnaryOp';
  operator: string;
  operand: ASTNode;
}

/**
 * Function call (e.g., SUM(A1:A5), IF(A1>0, "yes", "no"))
 */
export interface FunctionCallNode extends ASTNode {
  type: 'FunctionCall';
  name: string;
  args: ASTNode[];
}

/**
 * Type guard to check if a node is a NumberNode
 */
export function isNumberNode(node: ASTNode): node is NumberNode {
  return node.type === 'Number';
}

/**
 * Type guard to check if a node is a StringNode
 */
export function isStringNode(node: ASTNode): node is StringNode {
  return node.type === 'String';
}

/**
 * Type guard to check if a node is a CellRefNode
 */
export function isCellRefNode(node: ASTNode): node is CellRefNode {
  return node.type === 'CellRef';
}

/**
 * Type guard to check if a node is a RangeNode
 */
export function isRangeNode(node: ASTNode): node is RangeNode {
  return node.type === 'Range';
}

/**
 * Type guard to check if a node is a BinaryOpNode
 */
export function isBinaryOpNode(node: ASTNode): node is BinaryOpNode {
  return node.type === 'BinaryOp';
}

/**
 * Type guard to check if a node is a UnaryOpNode
 */
export function isUnaryOpNode(node: ASTNode): node is UnaryOpNode {
  return node.type === 'UnaryOp';
}

/**
 * Type guard to check if a node is a FunctionCallNode
 */
export function isFunctionCallNode(node: ASTNode): node is FunctionCallNode {
  return node.type === 'FunctionCall';
}
