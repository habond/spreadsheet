import { Spreadsheet } from '../data/spreadsheet';
import { EvalEngine } from '../core/eval-engine';
import { UIRenderer } from './ui-renderer';

/**
 * Manages all user interaction event handlers
 */
export class EventHandlers {
  constructor(
    private spreadsheet: Spreadsheet,
    private evalEngine: EvalEngine,
    private uiRenderer: UIRenderer
  ) {}

  /**
   * Setup all event listeners
   */
  setupEventListeners(): void {
    this.setupCellClickHandler();
    this.setupFormulaInputHandler();
    this.setupKeyboardNavigation();
  }

  /**
   * Handle cell click events
   */
  private setupCellClickHandler(): void {
    const grid = this.uiRenderer.getGrid();
    grid.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('cell')) {
        const cellId = target.dataset.cellId;
        if (cellId) {
          this.selectCell(cellId);
        }
      }
    });
  }

  /**
   * Handle formula input submission
   */
  private setupFormulaInputHandler(): void {
    const formulaInput = this.uiRenderer.getFormulaInput();
    formulaInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        this.handleFormulaSubmit(e);
        e.preventDefault();
      }
    });
  }

  /**
   * Handle formula submission
   */
  private handleFormulaSubmit(e: KeyboardEvent): void {
    const selectedCellId = this.spreadsheet.getSelectedCell();
    if (!selectedCellId) {
      return;
    }

    const formulaInput = this.uiRenderer.getFormulaInput();
    const oldValue = this.spreadsheet.getCellContent(selectedCellId);
    const newValue = formulaInput.value;

    // Store the raw content in the spreadsheet
    this.spreadsheet.setCellContent(selectedCellId, newValue);

    // Notify the eval engine that the cell changed
    this.evalEngine.onCellChanged(selectedCellId, oldValue, newValue);

    this.uiRenderer.updateInfoDisplay();

    // Move to the next cell
    this.navigateAfterSubmit(e);
  }

  /**
   * Navigate to the next cell after submitting a value
   */
  private navigateAfterSubmit(e: KeyboardEvent): void {
    let nextCellId: string | null = null;

    if (e.key === 'Enter') {
      // Enter moves down
      nextCellId = this.spreadsheet.navigateDown();
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab moves left
        nextCellId = this.spreadsheet.navigateLeft();
      } else {
        // Tab moves right
        nextCellId = this.spreadsheet.navigateRight();
      }
    }

    if (nextCellId) {
      this.selectCell(nextCellId);
    }
  }

  /**
   * Setup keyboard navigation with arrow keys
   */
  private setupKeyboardNavigation(): void {
    const formulaInput = this.uiRenderer.getFormulaInput();

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Only handle arrow keys when the formula input is focused
      if (document.activeElement !== formulaInput) {
        return;
      }

      let nextCellId: string | null = null;

      switch (e.key) {
        case 'ArrowUp':
          nextCellId = this.spreadsheet.navigateUp();
          e.preventDefault();
          break;
        case 'ArrowDown':
          nextCellId = this.spreadsheet.navigateDown();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          // Only navigate if cursor is at the beginning of the input
          if (formulaInput.selectionStart === 0 && formulaInput.selectionEnd === 0) {
            nextCellId = this.spreadsheet.navigateLeft();
            e.preventDefault();
          }
          break;
        case 'ArrowRight':
          // Only navigate if cursor is at the end of the input
          if (
            formulaInput.selectionStart === formulaInput.value.length &&
            formulaInput.selectionEnd === formulaInput.value.length
          ) {
            nextCellId = this.spreadsheet.navigateRight();
            e.preventDefault();
          }
          break;
      }

      if (nextCellId) {
        this.selectCell(nextCellId);
      }
    });
  }

  /**
   * Select a cell (updates both model and view)
   */
  private selectCell(cellId: string): void {
    this.spreadsheet.selectCell(cellId);
    this.uiRenderer.selectCell(cellId);
  }
}
