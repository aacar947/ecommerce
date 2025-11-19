import api from '../utils/api';
import useInfiniteProductQuery from './useInfiniteProductQuery';

export default function useProductCategory(categoryName, params, queryKey = []) {
  return useInfiniteProductQuery((searchParams) => api.getProductsByCategory(categoryName, searchParams), params, queryKey);
}
