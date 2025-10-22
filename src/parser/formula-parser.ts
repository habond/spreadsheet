/**
 * Formula parser - converts formula strings into Abstract Syntax Trees
 */

import { CellID } from '../types/core';
import { expandRange } from './helpers';
import { ASTNode } from '../types/ast';
import { tokenize } from './tokenizer';
import { ASTParser } from './ast-parser';

// Match range references like A1:B3, AA10:AB20, etc.
const RANGE_PATTERN = /\b[A-Z]+[0-9]+:[A-Z]+[0-9]+\b/g;

// Match cell references like A1, B2, AA10, etc.
const CELL_REF_PATTERN = /\b[A-Z]+[0-9]+\b/g;

/**
 * Parse a formula string into an Abstract Syntax Tree
 */
export function parse(formula: string): ASTNode {
  const tokens = tokenize(formula);
  const parser = new ASTParser(tokens);
  return parser.parse();
}

/**
 * Extract all cell references from a formula (including ranges expanded)
 */
export function extractCellReferences(formula: string): Set<CellID> {
  const refs = new Set<CellID>();

  // Extract and expand ranges first (now returns 2D arrays)
  const rangeMatches = formula.match(RANGE_PATTERN);
  if (rangeMatches) {
    rangeMatches.forEach(range => {
      const expandedCells = expandRange(range);
      // Flatten 2D array to get all cell IDs
      expandedCells.forEach(row => {
        row.forEach(cell => refs.add(cell));
      });
    });
  }

  // Remove ranges from formula temporarily to avoid double-matching
  const formulaWithoutRanges = formula.replace(RANGE_PATTERN, '');

  // Extract individual cell references
  const cellMatches = formulaWithoutRanges.match(CELL_REF_PATTERN);
  if (cellMatches) {
    cellMatches.forEach(ref => refs.add(ref));
  }

  return refs;
}
