import api from '../utils/api';
import useInfiniteProductQuery from './useInfiniteProductQuery';

export default function useSearchQuery(params = new URLSearchParams()) {
  return useInfiniteProductQuery((searchParams) => api.searchQuery(searchParams), params);
}
