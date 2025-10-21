import { useState, useRef, useCallback } from 'react';
import { SUPPORTED_FUNCTIONS } from '../../core/evaluation/formula-calculator';
import { useClickOutside } from '../hooks/useClickOutside';

interface FunctionMenuProps {
  onFunctionSelect: (functionName: string) => void;
}

export function FunctionMenu({ onFunctionSelect }: FunctionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => setIsOpen(false), []);
  useClickOutside(menuRef, isOpen ? handleClose : () => {});

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
