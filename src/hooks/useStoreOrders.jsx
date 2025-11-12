import useUser from './useUser';
import api from '../utils/api';
import useInfiniteProductQuery from './useInfiniteProductQuery';

export default function useStoreOrders(params) {
  const userId = useUser((s) => s?.user?.id);
  const isGuest = useUser((s) => s?.isGuest);
  const isAdmin = useUser((s) => s?.isAdmin);
  params.set('limit', 3);

  const { data, fetchNextPage, hasNextPage, limit, isFetching } = useInfiniteProductQuery(
    async (searchParams) => {
      if (isGuest || !isAdmin) Promise.reject(new Error('Store orders are not available for non-authenticated users. Please login with an authenticated user.'));
      const res = await api.getStoreOrders(searchParams);
      if (!res.data) return null;
      return res.data;
    },
    params,
    ['orders', isAdmin, isGuest, userId]
  );

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    limit,
  };
}
