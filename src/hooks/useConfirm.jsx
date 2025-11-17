import { useCallback, useEffect, useState } from 'react';
import DialogBox from '../components/DialogBox';
import useModal from './useModal';

export default function useConfirm() {
  const [confirmState, setConfirmState] = useState();
  const handleClose = (response) => {
    if (confirmState?.resolve) confirmState.resolve(response);
    setConfirmState(null);
    setShowModal(false);
  };

  const [showModal, setShowModal] = useModal({
    Component: DialogBox,
    className: 'confirm-modal flex',
    props: {
      ...confirmState?.props,
      onConfirm: () => handleClose(true),
      onCancel: () => handleClose(false),
    },
  });

  useEffect(() => {
    if (confirmState) setShowModal(true);
    else setShowModal(false);
  }, [confirmState, setShowModal]);

  useEffect(() => {
    if (!showModal) setConfirmState(null);
  }, [showModal]);

  const confirm = useCallback(
    (props) => {
      const promise = new Promise((resolve) => {
        setConfirmState({ props, resolve });
      });
      return promise;
    },
    [setConfirmState]
  );

  return confirm;
}
