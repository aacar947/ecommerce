import { useContextSelector } from 'use-context-selector';
import { ProductContext } from '../contexts/ProductProvider';

export default function useProductContext(selector = (s) => s || null) {
  return useContextSelector(ProductContext, selector);
}
