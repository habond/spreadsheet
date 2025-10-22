import { useSyncExternalStore, useCallback, useRef } from 'react';
import type { CellID } from '../../types/core';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

/**
 * Hook to subscribe to a specific cell's value
 * Uses React's useSyncExternalStore for efficient, granular updates
 * Only the cells that actually change will re-render
 *
 * @param cellId - The cell identifier to subscribe to
 * @returns Object containing the cell's display value and error state
 */
export function useCellValue(cellId: CellID) {
  const { cellResultStore } = useSpreadsheet();

  // Cache the last snapshot to prevent infinite loops
  const snapshotRef = useRef<{ displayValue: string; error: string | null }>({
    displayValue: '',
    error: null,
  });

  // Subscribe to changes for this specific cell
  const subscribe = useCallback(
    (callback: () => void) => {
      return cellResultStore.subscribe(cellId, callback);
    },
    [cellResultStore, cellId]
  );

  // Get the current snapshot of the cell data (with caching)
  const getSnapshot = useCallback(() => {
    const result = cellResultStore.get(cellId);
    const displayValue = cellResultStore.getDisplayValue(cellId);
    const error = result?.error || null;

    // Only create a new object if the values actually changed
    if (snapshotRef.current.displayValue === displayValue && snapshotRef.current.error === error) {
      return snapshotRef.current;
    }

    // Values changed, create and cache new snapshot
    snapshotRef.current = { displayValue, error };
    return snapshotRef.current;
  }, [cellResultStore, cellId]);

  // Use useSyncExternalStore to efficiently subscribe to this cell
  const cellData = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return cellData;
}
