import { useEffect, useRef } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

interface GridHeaderContextMenuProps {
  x: number;
  y: number;
  type: 'column' | 'row';
  index: number;
  onClose: () => void;
}

export function GridHeaderContextMenu({ x, y, type, index, onClose }: GridHeaderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    insertColumnLeft,
    insertColumnRight,
    insertRowAbove,
    insertRowBelow,
    deleteColumn,
    deleteRow,
  } = useSpreadsheet();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Add listener on next tick to avoid closing immediately
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleInsertLeft = () => {
    insertColumnLeft(index);
    onClose();
  };

  const handleInsertRight = () => {
    insertColumnRight(index);
    onClose();
  };

  const handleInsertAbove = () => {
    insertRowAbove(index);
    onClose();
  };

  const handleInsertBelow = () => {
    insertRowBelow(index);
    onClose();
  };

  const handleDeleteColumn = () => {
    deleteColumn(index);
    onClose();
  };

  const handleDeleteRow = () => {
    deleteRow(index);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
      data-testid="grid-header-context-menu"
    >
      {type === 'column' ? (
        <>
          <button
            className="context-menu-item context-menu-item-insert"
            onClick={handleInsertLeft}
            type="button"
          >
            <span className="context-menu-icon">➕</span>
            Insert Column Left
          </button>
          <button
            className="context-menu-item context-menu-item-insert"
            onClick={handleInsertRight}
            type="button"
          >
            <span className="context-menu-icon">➕</span>
            Insert Column Right
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item context-menu-item-delete"
            onClick={handleDeleteColumn}
            type="button"
          >
            <span className="context-menu-icon">🗑️</span>
            Delete Column
          </button>
        </>
      ) : (
        <>
          <button
            className="context-menu-item context-menu-item-insert"
            onClick={handleInsertAbove}
            type="button"
          >
            <span className="context-menu-icon">➕</span>
            Insert Row Above
          </button>
          <button
            className="context-menu-item context-menu-item-insert"
            onClick={handleInsertBelow}
            type="button"
          >
            <span className="context-menu-icon">➕</span>
            Insert Row Below
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item context-menu-item-delete"
            onClick={handleDeleteRow}
            type="button"
          >
            <span className="context-menu-icon">🗑️</span>
            Delete Row
          </button>
        </>
      )}
    </div>
  );
}
