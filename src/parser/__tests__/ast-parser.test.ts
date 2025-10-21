import { describe, it, expect } from 'vitest';
import { ASTParser } from '../ast-parser';
import { tokenize } from '../tokenizer';
import type { NumberNode, StringNode, CellRefNode, BinaryOpNode, UnaryOpNode, FunctionCallNode, RangeNode } from '../../types/ast';
import { FormulaParseError } from '../../errors/FormulaParseError';

describe('ASTParser', () => {
  describe('basic literals', () => {
    it('should parse a number', () => {
      const tokens = tokenize('42');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Number');
      expect((ast as NumberNode).value).toBe(42);
    });

    it('should parse a decimal number', () => {
      const tokens = tokenize('3.14');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Number');
      expect((ast as NumberNode).value).toBe(3.14);
    });

    it('should parse a string', () => {
      const tokens = tokenize('"hello"');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('String');
      expect((ast as StringNode).value).toBe('hello');
    });

    it('should parse a cell reference', () => {
      const tokens = tokenize('A1');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('CellRef');
      expect((ast as CellRefNode).cellId).toBe('A1');
    });

    it('should parse a multi-letter cell reference', () => {
      const tokens = tokenize('AA10');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('CellRef');
      expect((ast as CellRefNode).cellId).toBe('AA10');
    });
  });

  describe('ranges', () => {
    it('should parse a range', () => {
      const tokens = tokenize('A1:B2');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Range');
      expect((ast as RangeNode).cells).toEqual(['A1', 'A2', 'B1', 'B2']);
    });

    it('should parse a multi-letter column range', () => {
      const tokens = tokenize('AA1:AB2');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Range');
      expect((ast as RangeNode).cells).toEqual(['AA1', 'AA2', 'AB1', 'AB2']);
    });
  });

  describe('unary operators', () => {
    it('should parse negative number', () => {
      const tokens = tokenize('-5');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('UnaryOp');
      const unary = ast as UnaryOpNode;
      expect(unary.operator).toBe('-');
      expect(unary.operand.type).toBe('Number');
      expect((unary.operand as NumberNode).value).toBe(5);
    });

    it('should parse negative cell reference', () => {
      const tokens = tokenize('-A1');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('UnaryOp');
      const unary = ast as UnaryOpNode;
      expect(unary.operator).toBe('-');
      expect(unary.operand.type).toBe('CellRef');
      expect((unary.operand as CellRefNode).cellId).toBe('A1');
    });

    it('should parse double negative', () => {
      const tokens = tokenize('--5');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('UnaryOp');
      const outer = ast as UnaryOpNode;
      expect(outer.operator).toBe('-');
      expect(outer.operand.type).toBe('UnaryOp');
      const inner = outer.operand as UnaryOpNode;
      expect(inner.operator).toBe('-');
      expect((inner.operand as NumberNode).value).toBe(5);
    });
  });

  describe('binary operators', () => {
    it('should parse addition', () => {
      const tokens = tokenize('5 + 3');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('+');
      expect((binary.left as NumberNode).value).toBe(5);
      expect((binary.right as NumberNode).value).toBe(3);
    });

    it('should parse subtraction', () => {
      const tokens = tokenize('10 - 3');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('-');
      expect((binary.left as NumberNode).value).toBe(10);
      expect((binary.right as NumberNode).value).toBe(3);
    });

    it('should parse multiplication', () => {
      const tokens = tokenize('4 * 5');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('*');
      expect((binary.left as NumberNode).value).toBe(4);
      expect((binary.right as NumberNode).value).toBe(5);
    });

    it('should parse division', () => {
      const tokens = tokenize('20 / 4');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('/');
      expect((binary.left as NumberNode).value).toBe(20);
      expect((binary.right as NumberNode).value).toBe(4);
    });
  });

  describe('comparison operators', () => {
    it('should parse greater than', () => {
      const tokens = tokenize('5 > 3');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('>');
      expect((binary.left as NumberNode).value).toBe(5);
      expect((binary.right as NumberNode).value).toBe(3);
    });

    it('should parse less than or equal', () => {
      const tokens = tokenize('A1 <= 10');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('<=');
      expect((binary.left as CellRefNode).cellId).toBe('A1');
      expect((binary.right as NumberNode).value).toBe(10);
    });

    it('should parse equality', () => {
      const tokens = tokenize('A1 = 5');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('=');
    });

    it('should parse not equal', () => {
      const tokens = tokenize('A1 <> 5');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('<>');
    });
  });

  describe('operator precedence', () => {
    it('should respect multiplication before addition', () => {
      const tokens = tokenize('2 + 3 * 4');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      // Should parse as: 2 + (3 * 4)
      expect(ast.type).toBe('BinaryOp');
      const add = ast as BinaryOpNode;
      expect(add.operator).toBe('+');
      expect((add.left as NumberNode).value).toBe(2);

      expect(add.right.type).toBe('BinaryOp');
      const mul = add.right as BinaryOpNode;
      expect(mul.operator).toBe('*');
      expect((mul.left as NumberNode).value).toBe(3);
      expect((mul.right as NumberNode).value).toBe(4);
    });

    it('should respect division before subtraction', () => {
      const tokens = tokenize('10 - 8 / 2');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      // Should parse as: 10 - (8 / 2)
      expect(ast.type).toBe('BinaryOp');
      const sub = ast as BinaryOpNode;
      expect(sub.operator).toBe('-');
      expect((sub.left as NumberNode).value).toBe(10);

      expect(sub.right.type).toBe('BinaryOp');
      const div = sub.right as BinaryOpNode;
      expect(div.operator).toBe('/');
      expect((div.left as NumberNode).value).toBe(8);
      expect((div.right as NumberNode).value).toBe(2);
    });

    it('should respect left-to-right for same precedence', () => {
      const tokens = tokenize('10 - 5 - 2');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      // Should parse as: (10 - 5) - 2
      expect(ast.type).toBe('BinaryOp');
      const outer = ast as BinaryOpNode;
      expect(outer.operator).toBe('-');
      expect((outer.right as NumberNode).value).toBe(2);

      expect(outer.left.type).toBe('BinaryOp');
      const inner = outer.left as BinaryOpNode;
      expect(inner.operator).toBe('-');
      expect((inner.left as NumberNode).value).toBe(10);
      expect((inner.right as NumberNode).value).toBe(5);
    });

    it('should respect comparison after arithmetic', () => {
      const tokens = tokenize('2 + 3 > 4');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      // Should parse as: (2 + 3) > 4
      expect(ast.type).toBe('BinaryOp');
      const comparison = ast as BinaryOpNode;
      expect(comparison.operator).toBe('>');
      expect((comparison.right as NumberNode).value).toBe(4);

      expect(comparison.left.type).toBe('BinaryOp');
      const add = comparison.left as BinaryOpNode;
      expect(add.operator).toBe('+');
      expect((add.left as NumberNode).value).toBe(2);
      expect((add.right as NumberNode).value).toBe(3);
    });
  });

  describe('parenthesized expressions', () => {
    it('should parse parenthesized number', () => {
      const tokens = tokenize('(5)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Number');
      expect((ast as NumberNode).value).toBe(5);
    });

    it('should parse parenthesized expression', () => {
      const tokens = tokenize('(2 + 3)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const binary = ast as BinaryOpNode;
      expect(binary.operator).toBe('+');
    });

    it('should override precedence with parentheses', () => {
      const tokens = tokenize('(2 + 3) * 4');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      // Should parse as: (2 + 3) * 4
      expect(ast.type).toBe('BinaryOp');
      const mul = ast as BinaryOpNode;
      expect(mul.operator).toBe('*');
      expect((mul.right as NumberNode).value).toBe(4);

      expect(mul.left.type).toBe('BinaryOp');
      const add = mul.left as BinaryOpNode;
      expect(add.operator).toBe('+');
      expect((add.left as NumberNode).value).toBe(2);
      expect((add.right as NumberNode).value).toBe(3);
    });

    it('should parse nested parentheses', () => {
      const tokens = tokenize('((2 + 3) * 4)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const mul = ast as BinaryOpNode;
      expect(mul.operator).toBe('*');
    });
  });

  describe('function calls', () => {
    it('should parse function with no arguments', () => {
      const tokens = tokenize('NOW()');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('NOW');
      expect(func.args).toHaveLength(0);
    });

    it('should parse function with one argument', () => {
      const tokens = tokenize('UPPER("hello")');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('UPPER');
      expect(func.args).toHaveLength(1);
      expect(func.args[0].type).toBe('String');
      expect((func.args[0] as StringNode).value).toBe('hello');
    });

    it('should parse function with multiple arguments', () => {
      const tokens = tokenize('SUM(1, 2, 3)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('SUM');
      expect(func.args).toHaveLength(3);
      expect((func.args[0] as NumberNode).value).toBe(1);
      expect((func.args[1] as NumberNode).value).toBe(2);
      expect((func.args[2] as NumberNode).value).toBe(3);
    });

    it('should parse function with cell references', () => {
      const tokens = tokenize('SUM(A1, B2)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('SUM');
      expect(func.args).toHaveLength(2);
      expect((func.args[0] as CellRefNode).cellId).toBe('A1');
      expect((func.args[1] as CellRefNode).cellId).toBe('B2');
    });

    it('should parse function with range', () => {
      const tokens = tokenize('SUM(A1:B2)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('SUM');
      expect(func.args).toHaveLength(1);
      expect(func.args[0].type).toBe('Range');
    });

    it('should parse function with expression arguments', () => {
      const tokens = tokenize('IF(A1 > 5, 10, 20)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const func = ast as FunctionCallNode;
      expect(func.name).toBe('IF');
      expect(func.args).toHaveLength(3);
      expect(func.args[0].type).toBe('BinaryOp');
      expect((func.args[1] as NumberNode).value).toBe(10);
      expect((func.args[2] as NumberNode).value).toBe(20);
    });

    it('should parse nested function calls', () => {
      const tokens = tokenize('SUM(1, AVERAGE(2, 3))');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('FunctionCall');
      const outer = ast as FunctionCallNode;
      expect(outer.name).toBe('SUM');
      expect(outer.args).toHaveLength(2);

      expect(outer.args[1].type).toBe('FunctionCall');
      const inner = outer.args[1] as FunctionCallNode;
      expect(inner.name).toBe('AVERAGE');
      expect(inner.args).toHaveLength(2);
    });
  });

  describe('complex expressions', () => {
    it('should parse mixed arithmetic and cell references', () => {
      const tokens = tokenize('A1 + 5 * B2');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const add = ast as BinaryOpNode;
      expect(add.operator).toBe('+');
      expect((add.left as CellRefNode).cellId).toBe('A1');

      const mul = add.right as BinaryOpNode;
      expect(mul.operator).toBe('*');
      expect((mul.left as NumberNode).value).toBe(5);
      expect((mul.right as CellRefNode).cellId).toBe('B2');
    });

    it('should parse function in arithmetic expression', () => {
      const tokens = tokenize('SUM(A1:A5) + 10');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const add = ast as BinaryOpNode;
      expect(add.operator).toBe('+');
      expect(add.left.type).toBe('FunctionCall');
      expect((add.right as NumberNode).value).toBe(10);
    });

    it('should parse comparison of functions', () => {
      const tokens = tokenize('SUM(A1:A5) > AVERAGE(B1:B5)');
      const parser = new ASTParser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('BinaryOp');
      const comparison = ast as BinaryOpNode;
      expect(comparison.operator).toBe('>');
      expect(comparison.left.type).toBe('FunctionCall');
      expect(comparison.right.type).toBe('FunctionCall');
    });
  });

  describe('error handling', () => {
    it('should throw on empty input', () => {
      const tokens: any[] = [];
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
      expect(() => parser.parse()).toThrow('Unexpected end of input');
    });

    it('should throw on unexpected token', () => {
      const tokens = tokenize('5 +');
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
    });

    it('should throw on mismatched parentheses', () => {
      const tokens = tokenize('(5 + 3');
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
    });

    it('should throw on extra closing parenthesis', () => {
      const tokens = tokenize('5 + 3)');
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
      expect(() => parser.parse()).toThrow(/Unexpected token/);
    });

    it('should throw on missing function arguments', () => {
      const tokens = tokenize('SUM(');
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
    });

    it('should throw on invalid token sequence', () => {
      const tokens = tokenize('5 5');
      const parser = new ASTParser(tokens);

      expect(() => parser.parse()).toThrow(FormulaParseError);
    });
  });
});
