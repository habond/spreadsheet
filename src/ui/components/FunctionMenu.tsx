import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_FUNCTIONS } from '../../core/evaluation/formula-calculator';

interface FunctionMenuProps {
  onFunctionSelect: (functionName: string) => void;
}

export function FunctionMenu({ onFunctionSelect }: FunctionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleFunctionClick = (functionName: string) => {
    onFunctionSelect(functionName);
    setIsOpen(false);
  };

  return (
    <div className="function-menu" ref={menuRef}>
      <button
        className="function-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Insert function"
      >
        ƒx
      </button>
      {isOpen && (
        <div className="function-menu-dropdown">
          {SUPPORTED_FUNCTIONS.map(fn => (
            <button
              key={fn.name}
              className="function-menu-item"
              onClick={() => handleFunctionClick(fn.name)}
            >
              <span className="function-name">{fn.name}</span>
              <span className="function-description">{fn.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
