import { createPortal } from 'react-dom';
import { useEffect, useRef, useCallback } from 'react';
import '../styles/modal.css';
import useEventListener from '../hooks/UseEventListener';

export default function Modal({ options, active, setActive }) {
  const { element, Component, props, className } = options;
  const intendedTarget = useRef(null);
  const ref = useRef();

  useEffect(() => {
    if (active) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [active]);

  const handlefocus = useCallback(
    (e) => {
      if (ref.current.contains(e.target)) return;
      setActive(false);
    },
    [setActive]
  );

  useEventListener('focusin', handlefocus, window, { enabled: active });

  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') setActive(false);
  });

  const handleClick = () => {
    if (intendedTarget.current === 'modal-body') setActive(false);
  };

  const handleMouseDown = (e) => {
    intendedTarget.current = e.target.id;
  };

  const modalClass = (active ? 'active' : '') + (className && active ? ' ' + className : '');

  return (
    <>
      {createPortal(
        <div ref={ref} id='modal-body' className={modalClass} onMouseDown={handleMouseDown} onClick={handleClick}>
          {element && element}
          {Component && <options.Component {...props} closeModal={() => setActive(false)} isModalOpen={active} />}
        </div>,
        document.getElementById('modal')
      )}
    </>
  );
}
