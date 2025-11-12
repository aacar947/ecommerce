import useApiAction from './useApiAction';
import useUser from './useUser';
import api from '../utils/api';

export default function usePostReview() {
  const isGuest = useUser((s) => s.isGuest);
  const userId = useUser((s) => s.user?.id);
  const {
    fetchAsync: postReview,
    isPending,
    isError,
    isSuccess,
  } = useApiAction({
    fetchKey: ['postReview', userId],
    fetchFn: async (review) => {
      if (isGuest) throw new Error('Guest cannot post review.');
      return await api.postReview(review);
    },
  });

  return {
    postReview,
    isPending,
    isError,
    isSuccess,
  };
}
