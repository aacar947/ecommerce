import { useState, useContext, useEffect, useCallback } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import api from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserContext } from './UserProvider';
import useNavigationState from '../hooks/useNavigationState';
import useUser from '../hooks/useUser';

const CartContext = createContext();
export default function CartProvider({ children }) {
  const userIsPending = useUser((s) => s.isPending);
  const userId = useUser((s) => s.user?.id);
  const isGuest = useUser((s) => s.isGuest);
  const [cart, setCart] = useState();
  const { setNavigationState } = useNavigationState(); // Using the custom hook to manage navigation state for loadingbar
  const queryClient = useQueryClient();

  const { data: res, isFetching } = useQuery({
    queryKey: ['cart', isGuest ? 'guest' : userId],
    queryFn: async () => {
      // If user is not logged in, get guest cart from api
      if (userId) {
        await api.mergeWithGuestCart(userId);
        return await api.getCartByUser(userId);
      } else if (isGuest) return await api.getGuestCart();
      return Promise.resolve({ cart: { products: [] }, statusText: 'OK', status: 200 });
    },
  });

  useEffect(() => {
    const state = isFetching ? 'loading' : 'idle';
    setNavigationState(state);
  }, [isFetching, setNavigationState]);

  useEffect(() => {
    if (res && res.statusText === 'OK') setCart(() => res.cart);
    // If user is logged in, update the user cart with the local storage cart
  }, [setCart, res]);

  const refreshCart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  const isPending = cart === undefined || userIsPending || res === undefined;

  return <CartContext.Provider value={{ cart, refreshCart, setCart, isPending, isFetching }}>{children}</CartContext.Provider>;
}

export { CartContext };
