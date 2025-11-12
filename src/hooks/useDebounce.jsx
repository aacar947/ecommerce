import { useState, useRef, useCallback } from 'react';

export default function useDebounce(initialValue, delay = 500) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  const setDebouncedVaulue = useCallback(
    (v) => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (typeof v === 'function') {
          setValue(v(value));
          return;
        }
        setValue(v);
      }, delay);
    },
    [delay, value, setValue]
  );

  const cancel = useCallback((value) => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    if (value !== undefined) setValue(value);
  }, []);

  return [value, setDebouncedVaulue, cancel];
}
