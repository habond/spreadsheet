/**
 * Cell styling utilities
 */

import { FontFamily, TextAlign, type CellStyle } from '../types/core';

/**
 * Default cell style values
 */
export const DEFAULT_CELL_STYLE: Required<CellStyle> = {
  textAlign: TextAlign.Left,
  bold: false,
  italic: false,
  underline: false,
  fontFamily: FontFamily.Arial,
  fontSize: 14,
  textColor: '#000000',
  backgroundColor: '#ffffff',
};

/**
 * Merge cell styles with defaults
 * Undefined properties are filled with defaults
 */
export function mergeWithDefaults(style: CellStyle | undefined): Required<CellStyle> {
  return {
    ...DEFAULT_CELL_STYLE,
    ...style,
  };
}

/**
 * Convert CellStyle to CSS properties object
 */
export function styleToCss(style: CellStyle): React.CSSProperties {
  const css: React.CSSProperties = {};

  if (style.textAlign !== undefined) {
    // Cell uses flexbox, so we need to use justifyContent instead of textAlign
    if (style.textAlign === TextAlign.Left) {
      css.justifyContent = 'flex-start';
    } else if (style.textAlign === TextAlign.Center) {
      css.justifyContent = 'center';
    } else if (style.textAlign === TextAlign.Right) {
      css.justifyContent = 'flex-end';
    }
  }

  if (style.bold) {
    css.fontWeight = 'bold';
  }

  if (style.italic) {
    css.fontStyle = 'italic';
  }

  if (style.underline) {
    css.textDecoration = 'underline';
  }

  if (style.fontFamily !== undefined) {
    css.fontFamily = style.fontFamily;
  }

  if (style.fontSize !== undefined) {
    css.fontSize = `${style.fontSize}px`;
  }

  if (style.textColor !== undefined) {
    css.color = style.textColor;
  }

  if (style.backgroundColor !== undefined) {
    css.backgroundColor = style.backgroundColor;
  }

  return css;
}
