import { useCallback, useEffect, useRef } from 'react';

export default function useDebouncedCallback(callback, dependencies, delay = 500) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
  }, []);

  const debouncedCallback = useCallback(
    (...args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel, ...dependencies]
  );

  debouncedCallback.cancelDebounce = cancel;

  return debouncedCallback;
}
