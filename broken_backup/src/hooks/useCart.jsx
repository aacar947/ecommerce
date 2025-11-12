import { useContextSelector } from 'use-context-selector';
import { CartContext } from '../contexts/CartProvider';

export default function useCart(selector = (c) => c) {
  return useContextSelector(CartContext, selector);
}
