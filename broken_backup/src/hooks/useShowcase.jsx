import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export default function useShowcase() {
  const { data, isLoading } = useQuery({
    queryKey: ['showcase'],
    queryFn: () => api.getShowcase(),
    staleTime: 1000 * 60 * 5, // 5 minutes: data is considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour: data stays in memory even if inactive
  });
  return { data, isLoading };
}
