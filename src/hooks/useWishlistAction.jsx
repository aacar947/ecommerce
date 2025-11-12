import useApiAction from './useApiAction';
import api from '../utils/api';
import useUser from './useUser';

export default function useWishlistAction(onSettled) {
  const userId = useUser((s) => s.user?.id);
  const isGuest = useUser((s) => s.isGuest);

  const {
    fetchAsync: addToWishlist,
    isPending: isAddingToWishlist,
    isError: addToWishlistError,
    isSuccess: addToWishlistSuccess,
  } = useApiAction({
    fetchKey: ['addToWishlist'],
    fecthFn: (productId) => {
      if (isGuest) throw new Error('Guest cannot add to wishlist.');
      return api.addToWishlist(userId, productId);
    },
    onSettled: (res, error) => {
      if (res) res.actionType = 'add';
      if (onSettled) onSettled(res, error);
    },
    onError: (err) => {
      console.error('Wishlist Action Error:\nAction: addToWishlist\n', err);
    },
  });

  const {
    fetchAsync: removeFromWishlist,
    isPending: isRemovingFromWishlist,
    isError: removeFromWishlistError,
    isSuccess: removeFromWishlistSuccess,
  } = useApiAction({
    fetchKey: ['removeFromWishlist'],
    fecthFn: (productId) => {
      if (isGuest) throw new Error('Guest cannot remove from wishlist.');
      return api.removeFromWishlist(userId, productId);
    },
    onSettled: (res, error) => {
      if (res) res.actionType = 'remove';
      const err = res.error || error;
      if (onSettled) onSettled(res, err);
    },
    onError: (err) => {
      console.error('Wishlist Action Error:\nAction: removeFromWishlist\n', err);
    },
  });

  const isPending = isAddingToWishlist || isRemovingFromWishlist;
  const isError = addToWishlistError || removeFromWishlistError;
  const isSuccess = addToWishlistSuccess || removeFromWishlistSuccess;

  return { addToWishlist, removeFromWishlist, isPending, isError, isSuccess };
}
