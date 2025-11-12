import { useEffect, useId } from 'react';
import usePostReview from '../hooks/usePostReview';
import useProduct from '../hooks/useProduct';
import useUser from '../hooks/useUser';
import '../styles/product-review-modal.css';
import Btn from './Btn';
import FlatBtn from './FlatBtn';
import StarRating from './StarRating';
import Icon from './Icon';
import toast from 'react-hot-toast';

export default function ProductReviewModal({ productId, closeModal, isModalOpen }) {
  const { data: product, isLoading, isError } = useProduct(productId, new URLSearchParams({ select: 'title,thumbnail,rating' }));

  useEffect(() => {
    if (isError || (!product && !isLoading)) {
      closeModal();
    }
  }, [isError, closeModal, product, isLoading]);

  if (!isModalOpen) return null;

  return (
    <div className='product-review-modal'>
      <FlatBtn icon='/icons/bold-cross.svg' className='close-modal-btn' onClick={closeModal} />
      {isLoading && <ProductReviewSkeleton />}
      {product && <ProductReviewForm product={product} closeModal={closeModal} isLoading={isLoading} />}
    </div>
  );
}

function ProductReviewForm({ product, closeModal }) {
  const id = useUser((s) => s?.user?.id);
  const isGuest = useUser((s) => s?.user?.isGuest);
  const { postReview, isPending: isPendingReview } = usePostReview();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGuest || !product.id) closeModal();
    const review = {
      productId: product.id,
      userId: id,
      rating: e.target.rating.value,
      comment: e.target.comment.value || null,
    };
    postReview(review)
      .then((res) => {
        if (res.status === 201) {
          e.target.reset();
          toast.success('Review submitted successfully.');
          closeModal();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to submit review.');
      });
  };

  return (
    <form onSubmit={handleSubmit} className='product-review-form'>
      <div className='form-header'>
        <ProductHeaderCard product={product} />
      </div>
      <div className='form-body'>
        <div className='form-item'>
          <h3 className='form-title pale'>How was your experience with this product?</h3>
          <RatingPicker />
        </div>
        <div className='form-item optional'>
          <h3 className='form-title pale'>Write your review about this product (optional)</h3>
          <textarea placeholder='Write your review here' className='styled-textarea' name='comment' maxLength={2000} />
        </div>
      </div>
      <div className='form-footer'>
        <Btn disabled={isPendingReview} type='submit'>
          Submit
        </Btn>
      </div>
    </form>
  );
}

function ProductHeaderCard({ product }) {
  if (!product) return null;
  const { thumbnail, title, rating } = product;
  return (
    <div className='product-header-card flex'>
      <div className='product-header-card-image'>
        <img className='image-contain' src={thumbnail} aria-label={title + ' image'} />
      </div>
      <div className='product-header-card-details'>
        <h4 className='product-header-card-title'>{title}</h4>
        <StarRating rating={rating} />
      </div>
    </div>
  );
}

function RatingPicker() {
  const ratingTitles = {
    1: 'Terrible',
    2: 'Bad',
    3: 'Average',
    4: 'Good',
    5: 'Great',
  };

  return (
    <div className='star-rating-container'>
      {[5, 4, 3, 2, 1].map((r) => (
        <RatingPickerItem key={'rating-item' + r} index={r} title={ratingTitles[r]} />
      ))}
    </div>
  );
}

function RatingPickerItem({ index, title }) {
  const id = useId();
  return (
    <>
      <input className='star-rating-input' type='radio' name='rating' id={id} value={index} required />
      <label className='star-rating-label' htmlFor={id} title={title} aria-label={title}>
        <Icon className='star-icon' icon='/icons/star.svg' />
        <Icon className='star-icon filled' icon='/icons/star-filled.svg' />
      </label>
    </>
  );
}

export function ProductReviewSkeleton() {
  return (
    <div className='product-review-form'>
      <div className='product-header-card flex skeleton'>
        <div className='product-header-card-image skeleton-item skeleton-image skeleton-item-fit'></div>
        <div className='product-header-card-details skeleton-item-fit'>
          <div className='skeleton-item skeleton-item-medium skeleton-item-200px'></div>
          <div className='skeleton-item skeleton-item-medium skeleton-item-100px'></div>
        </div>
      </div>
      <div className='skeleton-item skeleton-item-medium'></div>
      <div className='skeleton-item skeleton-item-medium skeleton-item-200px'></div>
    </div>
  );
}
