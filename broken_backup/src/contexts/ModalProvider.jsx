import { useState, createContext } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext();

export default function ModalProvider({ children }) {
  const [options, setOptions] = useState({});
  const [active, setActive] = useState(false);

  return (
    <ModalContext.Provider value={{ setOptions, active, setActive }}>
      {children} <Modal options={options} active={active} setActive={setActive} />
    </ModalContext.Provider>
  );
}

export { ModalContext };
