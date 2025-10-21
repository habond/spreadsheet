import { useState, useRef, useCallback } from 'react';
import { InfoDisplay } from './InfoDisplay';
import { useClickOutside } from '../hooks/useClickOutside';

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => setIsOpen(false), []);
  useClickOutside(popoverRef, isOpen ? handleClose : () => {});

  return (
    <div className="info-button-container" ref={popoverRef}>
      <button className="info-button" onClick={() => setIsOpen(!isOpen)} title="Show cell info">
        ⓘ
      </button>
      {isOpen && (
        <div className="info-popover">
          <InfoDisplay />
        </div>
      )}
    </div>
  );
}
