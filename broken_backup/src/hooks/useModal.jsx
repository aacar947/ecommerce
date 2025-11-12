import { useCallback, useContext, useEffect, useRef } from 'react';
import { ModalContext } from '../contexts/ModalProvider';

export default function useModal(options = {}) {
  const { setOptions, active, setActive } = useContext(ModalContext);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const setShow = useCallback(
    (open) => {
      setOptions(optionsRef.current);
      setActive(open);
    },
    [setActive, setOptions]
  );

  return [active, setShow];
}
