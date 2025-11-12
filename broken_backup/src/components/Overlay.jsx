import { useCallback, useEffect } from 'react';
import useEventListener from '../hooks/UseEventListener';

export default function Overlay({ children, active, setActive }) {
  useEffect(() => {
    if (active) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [active]);

  const handleKeydown = useCallback(
    (e) => {
      if (e.key === 'Escape') setActive(false);
    },
    [setActive]
  );

  useEventListener('keydown', handleKeydown);

  return (
    <div className='overlay' data-active={active} onClick={() => setActive(false)}>
      {children}
    </div>
  );
}
