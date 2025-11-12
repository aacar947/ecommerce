import { useNavigate } from 'react-router';
import ImageViewer, { ImageViewerSkeleton } from './ImageViewer';
import StarRating from './StarRating';
import PriceTag from './PriceTag';
import '../styles/skeleton.css';
import FlatBtn from './FlatBtn';
import { useCallback, useEffect, useState } from 'react';
import useCartAction from '../hooks/useCartAction';
import toast from 'react-hot-toast';
import useWishlistAction from '../hooks/useWishlistAction';
import useUser from '../hooks/useUser';
import { slugParser } from '../utils/slugParser';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const url = '/p/' + slugParser.slugify({ title: product?.title, id: product?.id });

  return (
    <div className='card flex-col' onClick={() => navigate(url)}>
      <ImageViewer images={product?.images} />
      <div className='desc'>
        <span className='title'>{product?.title}</span>
        <PriceTag product={product} />
        <StarRating rating={product?.rating} />
        <div className='shipping-info pale'>{product?.shippingInformation}</div>
      </div>
      <ActionBtns product={product} />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className='card flex-col skeleton'>
      <ImageViewerSkeleton />
      <div className='desc skeleton-body'>
        <div className='title skeleton-item'></div>
        <div className='price skeleton-item skeleton-item-25 skeleton-item-large'></div>
        <div className='skeleton-item skeleton-item-small skeleton-item-75'></div>
        <div className='shipping-info skeleton-item skeleton-item-small skeleton-item-80'></div>
      </div>
    </div>
  );
}

function ActionBtns({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted);
  const { addToCart, isPending, isSuccess } = useCartAction();
  const isGuest = useUser((s) => s.isGuest);
  const navigate = useNavigate();

  const handleSettle = useCallback(
    (res, error) => {
      if (res?.actionType === 'add') setIsWishlisted(true);
      if (res?.actionType === 'remove' || error) setIsWishlisted(false);
    },
    [setIsWishlisted]
  );

  const { addToWishlist, removeFromWishlist } = useWishlistAction(handleSettle);

  useEffect(() => {
    if (isSuccess && !isPending) {
      toast.success('Added to cart');
    }
  }, [isSuccess, isPending]);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isGuest) return navigate('/login');
    if (!isWishlisted) addToWishlist(product?.id);
    else removeFromWishlist(product?.id);
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product?.id, 1);
  };

  return (
    <div className='action-btns'>
      <FlatBtn onClick={handleAddToCart} className='btn add-to-cart-btn' icon='/icons/add-cart.svg' disabled={isPending} />
      <FlatBtn onClick={handleWishlistClick} className={'btn wishlist-btn' + (isWishlisted ? ' wishlisted' : '')} icon={isWishlisted ? '/icons/heart-filled.svg' : '/icons/heart.svg'} />
    </div>
  );
}
