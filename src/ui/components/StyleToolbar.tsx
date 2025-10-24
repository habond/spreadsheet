import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Palette,
  Type,
  Underline,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CellFormat, FontFamily, TextAlign } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

export function StyleToolbar() {
  const { spreadsheet, selectedCell, cellResultStore, updateCellStyle, setCellFormat } =
    useSpreadsheet();

  // Read current style and format directly from spreadsheet
  const currentStyle = selectedCell ? spreadsheet.getCellStyle(selectedCell) || {} : {};
  const currentFormat = selectedCell ? spreadsheet.getCellFormat(selectedCell) : CellFormat.Raw;

  // Force re-render when the selected cell's style/format changes
  const [, forceUpdate] = useState<object>({});

  useEffect(() => {
    if (!selectedCell) return;

    // Subscribe to changes for the selected cell
    const unsubscribe = cellResultStore.subscribe(selectedCell, () => {
      // Trigger a re-render
      forceUpdate({});
    });

    return unsubscribe;
  }, [selectedCell, cellResultStore]);

  const handleToggleBold = () => {
    if (!selectedCell) return;
    const newValue = !currentStyle.bold;
    updateCellStyle(selectedCell, { bold: newValue });
  };

  const handleToggleItalic = () => {
    if (!selectedCell) return;
    const newValue = !currentStyle.italic;
    updateCellStyle(selectedCell, { italic: newValue });
  };

  const handleToggleUnderline = () => {
    if (!selectedCell) return;
    const newValue = !currentStyle.underline;
    updateCellStyle(selectedCell, { underline: newValue });
  };

  const handleAlignmentChange = (align: TextAlign) => {
    if (!selectedCell) return;
    updateCellStyle(selectedCell, { textAlign: align });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedCell) return;
    const fontFamily = e.target.value as FontFamily;
    updateCellStyle(selectedCell, { fontFamily });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return;
    const textColor = e.target.value;
    updateCellStyle(selectedCell, { textColor });
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return;
    const backgroundColor = e.target.value;
    updateCellStyle(selectedCell, { backgroundColor });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedCell) return;
    const format = e.target.value as CellFormat;
    setCellFormat(selectedCell, format);
  };

  const handleClearFormatting = () => {
    if (!selectedCell) return;
    // Clear all styles and reset format to Raw
    spreadsheet.clearCellStyle(selectedCell);
    setCellFormat(selectedCell, CellFormat.Raw);
  };

  return (
    <div className="style-toolbar">
      {/* Format dropdown */}
      <select
        className="format-dropdown"
        value={currentFormat}
        onChange={handleFormatChange}
        title="Cell format"
        disabled={!selectedCell}
      >
        <option value={CellFormat.Raw}>Normal</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Number}>{CellFormat.Number}</option>
        <option value={CellFormat.Currency}>{CellFormat.Currency}</option>
        <option value={CellFormat.Percentage}>{CellFormat.Percentage}</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Date}>{CellFormat.Date}</option>
        <option value={CellFormat.Time}>{CellFormat.Time}</option>
        <option disabled>──────────</option>
        <option value={CellFormat.Boolean}>{CellFormat.Boolean}</option>
      </select>

      {/* Font family dropdown */}
      <select
        className="font-family-dropdown"
        value={currentStyle.fontFamily || FontFamily.Arial}
        onChange={handleFontFamilyChange}
        title="Font family"
        disabled={!selectedCell}
      >
        <option value={FontFamily.Arial}>Arial</option>
        <option value={FontFamily.TimesNewRoman}>Times New Roman</option>
        <option value={FontFamily.Courier}>Courier New</option>
        <option value={FontFamily.Verdana}>Verdana</option>
        <option value={FontFamily.Georgia}>Georgia</option>
        <option value={FontFamily.ComicSans}>Comic Sans MS</option>
      </select>

      {/* Typeface buttons group */}
      <div className="style-button-group">
        <button
          className={`style-button${currentStyle.bold ? ' active' : ''}`}
          onClick={handleToggleBold}
          title="Bold"
          disabled={!selectedCell}
        >
          <Bold size={16} />
        </button>
        <button
          className={`style-button${currentStyle.italic ? ' active' : ''}`}
          onClick={handleToggleItalic}
          title="Italic"
          disabled={!selectedCell}
        >
          <Italic size={16} />
        </button>
        <button
          className={`style-button${currentStyle.underline ? ' active' : ''}`}
          onClick={handleToggleUnderline}
          title="Underline"
          disabled={!selectedCell}
        >
          <Underline size={16} />
        </button>
      </div>

      {/* Alignment buttons group */}
      <div className="style-button-group">
        <button
          className={`style-button${currentStyle.textAlign === TextAlign.Left ? ' active' : ''}`}
          onClick={() => handleAlignmentChange(TextAlign.Left)}
          title="Align left"
          disabled={!selectedCell}
        >
          <AlignLeft size={16} />
        </button>
        <button
          className={`style-button${currentStyle.textAlign === TextAlign.Center ? ' active' : ''}`}
          onClick={() => handleAlignmentChange(TextAlign.Center)}
          title="Align center"
          disabled={!selectedCell}
        >
          <AlignCenter size={16} />
        </button>
        <button
          className={`style-button${currentStyle.textAlign === TextAlign.Right ? ' active' : ''}`}
          onClick={() => handleAlignmentChange(TextAlign.Right)}
          title="Align right"
          disabled={!selectedCell}
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Color pickers group */}
      <div className="style-button-group">
        <label className="color-picker-label" title="Text color">
          <Type size={16} />
          <input
            type="color"
            className="color-picker"
            value={currentStyle.textColor || '#000000'}
            onChange={handleTextColorChange}
            disabled={!selectedCell}
          />
        </label>
        <label className="color-picker-label" title="Background color">
          <Palette size={16} />
          <input
            type="color"
            className="color-picker"
            value={currentStyle.backgroundColor || '#ffffff'}
            onChange={handleBackgroundColorChange}
            disabled={!selectedCell}
          />
        </label>
      </div>

      {/* Clear formatting button */}
      <button
        className="clear-formatting-button"
        onClick={handleClearFormatting}
        title="Clear all formatting"
        disabled={!selectedCell}
      >
        <Eraser size={16} />
      </button>
    </div>
  );
}
