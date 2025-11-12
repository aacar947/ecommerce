import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import useNavigationState from './useNavigationState';
import { useCallback } from 'react';
import { CartContext } from '../contexts/CartProvider';
import { useContextSelector } from 'use-context-selector';
import useUser from './useUser';

export default function useUpdateCart() {
  const { setNavigationState } = useNavigationState(); // Using the custom hook to manage navigation state for loadingbar
  const cartId = useContextSelector(CartContext, (s) => s.cart.id);
  const setCart = useContextSelector(CartContext, (s) => s.setCart);
  const isGuest = useUser((s) => s.isGuest);

  const { mutate, isPending, isError, isIdle } = useMutation({
    mutationKey: ['updateCart'],
    mutationFn: async (products) => {
      return isGuest ? await api.updateGuestCart(products) : await api.updateCart(cartId, products);
    },
    retryDelay: 1000,
    onSuccess: (res) => {
      setCart(res.cart);
    },
    onMutate: () => {
      setNavigationState('submitting');
    },
    onSettled: () => {
      setNavigationState('idle');
    },
  });

  const updateCart = useCallback(
    (products) => {
      mutate(products);
    },
    [mutate]
  );

  return { isError, isPending, isIdle, updateCart };
}
