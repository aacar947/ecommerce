import { useRef, useEffect } from 'react';

export default function useEventListener(eventName, callback, element = window, options = {}) {
  const callbackRef = useRef();
  const { capture, passive, once, enabled = true } = options;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const supported = element && element.addEventListener;
    if (!supported || !eventName || !enabled) {
      return;
    }

    const eventListener = (event) => callbackRef.current(event);
    const opts = { capture, passive, once };
    element.addEventListener(eventName, eventListener, opts);
    return () => {
      element.removeEventListener(eventName, eventListener, opts);
    };
  }, [eventName, element, capture, passive, once, enabled]);
}
