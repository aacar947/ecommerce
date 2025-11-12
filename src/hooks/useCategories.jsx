import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export default function useCategories() {
  const { data, isFetching, isError, error, isSuccess } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      return api.getCategories();
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data,
    isFetching,
    isError,
    error,
    isSuccess,
  };
}
