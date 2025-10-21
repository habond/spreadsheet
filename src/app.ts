/**
 * Application initialization and orchestration
 */

import { Spreadsheet } from './data/spreadsheet.js';
import { EvalEngine } from './core/eval-engine.js';
import { CellResultStore } from './data/cell-result-store.js';
import { UIRenderer } from './ui/ui-renderer.js';
import { EventHandlers } from './ui/event-handlers.js';

// Initialize core components
const spreadsheet = new Spreadsheet(20, 10);
const cellResultStore = new CellResultStore();

// Create eval engine with callbacks
const evalEngine = new EvalEngine(
  // getCellValue callback - returns raw content
  (cellId) => spreadsheet.getCellContent(cellId),

  // getCellResult callback - returns cached evaluation result
  (cellId) => cellResultStore.get(cellId),

  // setCellResult callback - stores evaluation results and updates UI
  (cellId, result) => {
    cellResultStore.set(cellId, result);
    uiRenderer.updateCellDisplay(cellId);
  }
);

// Create UI renderer
const uiRenderer = new UIRenderer(spreadsheet, cellResultStore);

// Create event handlers
const eventHandlers = new EventHandlers(spreadsheet, evalEngine, uiRenderer);

/**
 * Initialize the spreadsheet application
 */
function init(): void {
  uiRenderer.createHeaders();
  uiRenderer.createGrid();
  eventHandlers.setupEventListeners();

  // Auto-focus cell A1
  spreadsheet.selectCell('A1');
  uiRenderer.selectCell('A1');
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose debugging interface
declare global {
  interface Window {
    spreadsheet: Spreadsheet;
    evalEngine: EvalEngine;
    cellResultStore: CellResultStore;
    refreshAllCells: () => void;
  }
}

window.spreadsheet = spreadsheet;
window.evalEngine = evalEngine;
window.cellResultStore = cellResultStore;
window.refreshAllCells = () => uiRenderer.refreshAllCells();
