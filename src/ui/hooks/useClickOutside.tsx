import { type RefObject, useEffect } from 'react';

/**
 * Custom hook to handle clicks outside of a referenced element
 * @param ref - Reference to the element to detect outside clicks for
 * @param callback - Function to call when click occurs outside the element
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}
