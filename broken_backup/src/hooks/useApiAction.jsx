import { useMutation } from '@tanstack/react-query';
import useNavigationState from './useNavigationState';

export default function useApiAction({ fetchFn, fetchKey = [], onSuccess, onError, onSettled, onMutate }) {
  const setNavigationState = useNavigationState((state) => state.setNavigationState);
  const { mutate, mutateAsync, isPending, isError, isSuccess, reset } = useMutation({
    mutationKey: [...fetchKey],
    mutationFn: fetchFn,
    retryDelay: 1000,
    onMutate: (args) => {
      setNavigationState('submitting');
      if (onMutate) onMutate(args);
    },
    onSuccess: (res) => {
      if (onSuccess) onSuccess(res);
    },
    onSettled: (res, error) => {
      setNavigationState('idle');
      if (onSettled) onSettled(res, error);
    },
    onError: (err) => {
      setNavigationState('idle');
      if (onError) onError(err);
    },
  });

  return { fetch: mutate, fetchAsync: mutateAsync, isError, isPending, isSuccess, reset };
}
