import { useCallback, useEffect, useRef } from 'react';

export default function useThrottle(callback, delay = 100) {
  const callBackRef = useRef(callback);
  const inDelay = useRef(false);
  const lastArgs = useRef(null);

  useEffect(() => {
    callBackRef.current = callback;
  }, [callback]);

  const trottledCallback = useCallback(
    (...args) => {
      if (inDelay.current) {
        lastArgs.current = args;
        return;
      }

      inDelay.current = true;

      setTimeout(() => {
        inDelay.current = false;
        if (lastArgs.current === null) return callBackRef.current();
        callBackRef.current(...lastArgs.current);
      }, delay);

      callBackRef.current(...args);
    },
    [delay]
  );

  return trottledCallback;
}
