import Icon from './Icon';

export default function StarRating({ showRatingNumber = true, rating, className, count = 5, ...rest }) {
  const percent = (rating * 100) / count;
  const stars = [...Array(count).keys()];

  return (
    <div className={className ? 'rating ' + className : 'rating'} {...rest} aria-label={rating + ' out of ' + count}>
      <div className='rating-container'>
        <div className='rating-bar rating-empty'>
          {stars.map((_, i) => (
            <Icon className='rating-icon' icon='/icons/star.svg' key={'star-icon' + i} />
          ))}
        </div>
        <div style={{ width: `${percent}%` }} className='rating-bar rating-filled'>
          {stars.map((_, i) => (
            <Icon key={'star-icon-filled' + i} className='rating-icon' icon='/icons/star-filled.svg' />
          ))}
        </div>
      </div>
      {showRatingNumber && <span>{rating}</span>}
    </div>
  );
}
