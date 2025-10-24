import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { CellID, CellStyle } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

/**
 * Hook to subscribe to a specific cell's value
 * Uses React's useSyncExternalStore for efficient, granular updates
 * Only the cells that actually change will re-render
 *
 * @param cellId - The cell identifier to subscribe to
 * @returns Object containing the cell's display value, error state, and style
 */
export function useCellValue(cellId: CellID) {
  const { cellResultStore, spreadsheet } = useSpreadsheet();

  // Cache the last snapshot to prevent infinite loops
  const snapshotRef = useRef<{
    displayValue: string;
    error: string | null;
    style: CellStyle | undefined;
  }>({
    displayValue: '',
    error: null,
    style: undefined,
  });

  // Subscribe to changes for this specific cell
  const subscribe = useCallback(
    (callback: () => void) => {
      return cellResultStore.subscribe(cellId, callback);
    },
    [cellResultStore, cellId]
  );

  // Get the current snapshot of the cell data
  // We include style in the snapshot so style changes trigger re-renders
  const getSnapshot = useCallback(() => {
    const result = cellResultStore.get(cellId);
    const displayValue = cellResultStore.getDisplayValue(cellId);
    const error = result?.error || null;
    const style = spreadsheet.getCellStyle(cellId);

    // Only create a new object if the values actually changed
    // Compare by reference for style object (it's a new object when it changes)
    if (
      snapshotRef.current.displayValue === displayValue &&
      snapshotRef.current.error === error &&
      snapshotRef.current.style === style
    ) {
      return snapshotRef.current;
    }

    // Values changed, create and cache new snapshot
    snapshotRef.current = { displayValue, error, style };
    return snapshotRef.current;
  }, [cellResultStore, cellId, spreadsheet]);

  // Use useSyncExternalStore to efficiently subscribe to this cell
  const cellData = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return cellData;
}
