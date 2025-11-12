import StarRating from './StarRating';
import defaultProfilePic from '../assets/profile.svg';
import Collapsible from './Collapsible';

export default function ReviewBox({ review }) {
  const date = new Date(review?.date);
  return (
    <div className='review'>
      <div className='review-profile'>
        <img src={defaultProfilePic} alt='' />
        <span className='-review-username'>{review?.reviewerName}</span>
      </div>
      <StarRating showRatingNumber={false} rating={review?.rating} />
      <span className='review-date'>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      <Collapsible maxHeight={64}>{review?.comment}</Collapsible>
    </div>
  );
}
