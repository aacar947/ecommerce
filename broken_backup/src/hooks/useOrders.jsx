import useUser from './useUser';
import api from '../utils/api';
import useInfiniteProductQuery from './useInfiniteProductQuery';

export default function useOrders(params) {
  const userId = useUser((s) => s.user?.id);
  const isGuest = useUser((s) => s.isGuest);
  params.set('limit', 3);

  const { data, fetchNextPage, hasNextPage, limit, isFetching } = useInfiniteProductQuery(
    async () => {
      if (isGuest) Promise.reject(new Error('Orders are not available for guest users. Please login.'));
      const res = await api.getOrders(userId);
      if (!res.data) return null;
      return res.data;
    },
    params,
    ['orders', userId]
  );

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    limit,
  };
}
