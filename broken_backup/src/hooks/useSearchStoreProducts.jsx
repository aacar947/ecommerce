import api from '../utils/api';
import useInfiniteProductQuery from './useInfiniteProductQuery';

export default function useSearchStoreProducts(params) {
  return useInfiniteProductQuery((searchParams) => api.searchStoreProducts(searchParams), params);
}
