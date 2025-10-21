import { CellID } from '../core/types';
import { Spreadsheet } from '../data/spreadsheet';
import { CellResultStore } from '../data/cell-result-store';

/**
 * Handles all DOM manipulation and rendering
 */
export class UIRenderer {
  private grid: HTMLElement;
  private columnHeaders: HTMLElement;
  private rowHeaders: HTMLElement;
  private formulaInput: HTMLInputElement;
  private currentCellDisplay: HTMLElement;
  private cellValueDisplay: HTMLElement;
  private errorDisplay: HTMLElement;

  constructor(
    private spreadsheet: Spreadsheet,
    private cellResultStore: CellResultStore
  ) {
    this.grid = document.getElementById('grid') as HTMLElement;
    this.columnHeaders = document.getElementById('column-headers') as HTMLElement;
    this.rowHeaders = document.getElementById('row-headers') as HTMLElement;
    this.formulaInput = document.getElementById('formula-input') as HTMLInputElement;
    this.currentCellDisplay = document.getElementById('current-cell') as HTMLElement;
    this.cellValueDisplay = document.getElementById('cell-value') as HTMLElement;
    this.errorDisplay = document.getElementById('error-display') as HTMLElement;
  }

  /**
   * Create column and row headers
   */
  createHeaders(): void {
    // Empty corner cell
    const corner = document.createElement('div');
    corner.className = 'column-header';
    this.columnHeaders.appendChild(corner);

    // Column headers (A, B, C, ...)
    for (let col = 0; col < this.spreadsheet.cols; col++) {
      const header = document.createElement('div');
      header.className = 'column-header';
      header.textContent = this.spreadsheet.columnIndexToLetter(col);
      this.columnHeaders.appendChild(header);
    }

    // Row headers (1, 2, 3, ...)
    for (let row = 0; row < this.spreadsheet.rows; row++) {
      const header = document.createElement('div');
      header.className = 'row-header';
      header.textContent = String(row + 1);
      this.rowHeaders.appendChild(header);
    }
  }

  /**
   * Create the grid of cells
   */
  createGrid(): void {
    for (let row = 0; row < this.spreadsheet.rows; row++) {
      for (let col = 0; col < this.spreadsheet.cols; col++) {
        const cell = document.createElement('div');
        const cellId = this.spreadsheet.getCellId(row, col);

        cell.className = 'cell';
        cell.dataset.cellId = cellId;
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);

        this.grid.appendChild(cell);
      }
    }
  }

  /**
   * Update the display of a specific cell
   */
  updateCellDisplay(cellId: CellID): void {
    const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;
    if (!cellElement) {
      return;
    }

    const result = this.cellResultStore.get(cellId);
    const displayValue = this.cellResultStore.getDisplayValue(cellId);
    cellElement.textContent = displayValue;

    // Update error styling
    if (result?.error) {
      cellElement.classList.add('error');
      cellElement.title = result.error;
    } else {
      cellElement.classList.remove('error');
      cellElement.title = '';
    }
  }

  /**
   * Select a cell visually and update the formula bar
   */
  selectCell(cellId: CellID): void {
    // Remove previous selection
    document.querySelectorAll('.cell.selected').forEach(cell => {
      cell.classList.remove('selected');
    });

    // Add new selection
    const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;
    if (!cellElement) {
      return;
    }

    cellElement.classList.add('selected');

    // Update formula input
    const content = this.spreadsheet.getCellContent(cellId);
    this.formulaInput.value = content;

    // Focus the formula bar
    this.formulaInput.focus();

    this.updateInfoDisplay();
  }

  /**
   * Update the info display (current cell, value, error)
   */
  updateInfoDisplay(): void {
    const selectedCellId = this.spreadsheet.getSelectedCell();
    if (!selectedCellId) {
      this.currentCellDisplay.textContent = '-';
      this.cellValueDisplay.textContent = '-';
      this.errorDisplay.style.display = 'none';
      return;
    }

    this.currentCellDisplay.textContent = selectedCellId;
    const result = this.cellResultStore.get(selectedCellId);
    const content = this.spreadsheet.getCellContent(selectedCellId);
    this.cellValueDisplay.textContent = this.cellResultStore.getDisplayValue(selectedCellId) || content || '(empty)';

    // Show error if cell has error
    const error = result?.error;
    if (error) {
      this.errorDisplay.textContent = `Error: ${error}`;
      this.errorDisplay.style.display = 'block';
    } else {
      this.errorDisplay.style.display = 'none';
    }
  }

  /**
   * Refresh all cell displays
   */
  refreshAllCells(): void {
    const cellIds = this.cellResultStore.getAllCellIds();
    cellIds.forEach(cellId => {
      this.updateCellDisplay(cellId);
    });
  }

  /**
   * Get the formula input element (for event listeners)
   */
  getFormulaInput(): HTMLInputElement {
    return this.formulaInput;
  }

  /**
   * Get the grid element (for event listeners)
   */
  getGrid(): HTMLElement {
    return this.grid;
  }
}
