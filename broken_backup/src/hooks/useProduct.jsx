import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useCallback } from 'react';

export default function useProduct(id, params) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id, params?.toString()],
    queryFn: () => api.getProduct(id, params) || null,
  });

  const refreshProduct = useCallback(() => {
    queryClient.invalidateQueries(['product', id]);
    refetch();
  }, [queryClient]);

  return { data, refreshProduct, isLoading, isError };
}
