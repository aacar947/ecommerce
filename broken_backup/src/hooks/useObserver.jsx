import React from 'react';

export default function useObserver({ threshold = 0, root = null, rootMargin = '0px', enabled = true, onIntersect }) {
  const observer = React.useRef(null);
  const [entry, setEntry] = React.useState(null);

  const ref = React.useCallback(
    (node) => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const handleEntry = ([_entry]) => {
        if (_entry.isIntersecting && enabled && onIntersect) onIntersect(_entry);
        if (!Boolean(onIntersect) && enabled) setEntry(_entry);
      };

      observer.current = new window.IntersectionObserver(handleEntry, { threshold, root, rootMargin });
      observer.current.observe(node);
    },
    [root, rootMargin, threshold, enabled, onIntersect]
  );

  return [ref, entry];
}
