import api from '../utils/api';
import { useCallback, useRef, useState } from 'react';
import useApiAction from './useApiAction';

export default function useImageUpload() {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const controller = useRef(new AbortController());

  const onUploadProgress = ({ progress }) => {
    setProgress(Math.round(progress * 100));
  };

  const { fetchAsync, isPending, isError, isSuccess, reset } = useApiAction({
    fetchKey: ['uploadImage'],
    fetchFn: async (file) => {
      controller.current = new AbortController();
      const signal = controller.current?.signal;
      try {
        const res = await api.uploadProductImage(file, onUploadProgress, signal);
        return res;
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return { aborted: true };
        throw err;
      }
    },
    onSettled: () => {
      setIsCompleted(true);
    },
    onError: (err) => {
      console.error('Image Upload Error:\nAction: uploadProductImage\n', err);
    },
  });

  const cancel = useCallback(() => {
    controller.current?.abort();
    reset();
    setProgress(0);
    setIsCompleted(false);
  }, [reset]);

  return {
    uploadProductImage: fetchAsync,
    isPending,
    isError,
    isSuccess,
    isCompleted,
    cancel,
    progress,
  };
}
