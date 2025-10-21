import { useState, useRef, useEffect } from 'react';
import { InfoDisplay } from './InfoDisplay';

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
