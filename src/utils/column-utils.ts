/**
 * Core utilities for column letter/number conversion
 * These are fundamental operations used throughout the spreadsheet
 */

/**
 * Convert column letter(s) to column number (A=1, B=2, Z=26, AA=27, etc.)
 */
export function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
}

/**
 * Convert column number to column letter(s) (1=A, 2=B, 26=Z, 27=AA, etc.)
 */
export function numberToColumn(num: number): string {
  let result = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode('A'.charCodeAt(0) + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}
