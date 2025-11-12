import api from '../utils/api';
import { useQuery } from '@tanstack/react-query';

export default function useOrderStatusList() {
  const { data, isLoading } = useQuery({
    queryKey: ['orderStatusList'],
    queryFn: () => api.getOrderStatusList().then((res) => res.data) || [],
    staleTime: Infinity,
    cacheTime: Infinity,
  });
  return { data, isLoading };
}
