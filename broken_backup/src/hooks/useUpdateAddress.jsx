import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import useUser from './useUser';
import useNavigationState from './useNavigationState';

export default function useUpdateAddress({ onSuccess }) {
  const isGuest = useUser((s) => s.isGuest);
  const userId = useUser((s) => s.user?.id);
  const setUser = useUser((s) => s.setUser);
  const setNavigationState = useNavigationState((state) => state.setNavigationState);

  const { mutateAsync, isPending, isError, isIdle, isSuccess, error } = useMutation({
    mutationKey: ['setAddress'],
    mutationFn: (address) => (!isGuest && userId ? api.updateUser(userId, { address }) : api.updateGuestAddress(address)),
    onSuccess: (res) => {
      if (!isGuest) setUser(res.data);
      if (onSuccess) onSuccess(res);
    },
  });

  useEffect(() => {
    if (isPending) {
      setNavigationState('submitting');
    } else {
      setNavigationState('idle');
    }
  }, [isPending, setNavigationState]);

  return {
    updateAddress: mutateAsync,
    isSuccess,
    isPending,
    isError,
    isIdle,
    error,
  };
}
