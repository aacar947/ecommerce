import api from '../utils/api';
import { useCallback } from 'react';
import useCart from './useCart';
import useUser from './useUser';
import useApiAction from './useApiAction';

export default function useCartAction() {
  const setCart = useCart((state) => state.setCart);
  const isGuest = useUser((s) => s.isGuest);
  const userId = useUser((s) => s.user?.id);
  const fetchAddToCart = async ({ id, quantity = 1 }) => (isGuest ? await api.addToGuestCart([{ id, quantity }]) : await api.addToCart(userId, [{ id, quantity }]));

  const {
    fetchAsync: mutateAddToCart,
    isPending: isAddingToCart,
    isError: addToCartError,
    isSuccess: addToCartSuccess,
  } = useApiAction({
    fetchKey: ['addToCart'],
    fetchFn: fetchAddToCart,
    retryDelay: 1000,
    onSuccess: (res) => {
      setCart(res.cart);
    },
  });

  const {
    fetchAsync: mutateRemoveFromCart,
    isPending: isRemovingFromCart,
    isError: removeFromCartError,
    isSuccess: removeFromCartSuccess,
  } = useApiAction({
    fetchKey: ['removeFromCart'],
    fetchFn: async (productId) => {
      return isGuest ? await api.removeFromGuestCart(productId) : await api.removeFromUserCart(userId, productId);
    },
    onSuccess: (res) => {
      if (res.statusText === 'OK') setCart(res.cart);
    },
  });

  const addToCart = useCallback((productId, quantity) => mutateAddToCart({ id: productId, quantity }), [mutateAddToCart]); // Ensure mutate is called with the correct parameters
  const removeFromCart = useCallback((productId) => mutateRemoveFromCart(productId), [mutateRemoveFromCart]);

  const isPending = isAddingToCart || isRemovingFromCart;
  const isError = addToCartError || removeFromCartError;
  const isIdle = !isPending;
  const isSuccess = addToCartSuccess || removeFromCartSuccess;

  return { addToCart, removeFromCart, isIdle, isError, isPending, isSuccess };
}
