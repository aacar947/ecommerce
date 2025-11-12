export default function PriceTag({ product }) {
  const price = product?.discountPercentage ? (product?.price * (1 - product?.discountPercentage / 100)).toFixed(2) : (product?.price, 2).toFixed(2);
  return (
    <div className='price-tag'>
      <p className='price'>${price}</p>
      <div className='price-details flex-col'>
        <span className='discount'>{product?.discountPercentage.toFixed(2)}%</span>
        <span className='prev-price'>{product?.price.toFixed(2)}</span>
      </div>
    </div>
  );
}
