import useCart from '../hooks/useCart';
import Btn from './Btn';
export default function TotalContainer({ btnText, btn, onClick }) {
  const total = useCart((state) => state.cart?.discountedTotal?.toFixed(2) || 0);
  const subtotal = useCart((state) => state.cart?.total || 0);
  const discount = useCart((state) => state.cart?.total - state.cart?.discountedTotal || 0);
  const totalProducts = useCart((state) => state.cart?.totalProducts || 0);
  const totalQuantity = useCart((state) => state.cart?.totalQuantity || 0);

  return (
    <div className='container'>
      <div className='total-info'>
        <h3 className='total-title'>TOTAL</h3>
        <p className='total-price'>${total}</p>
      </div>
      <Split title='Subtotal'>${subtotal.toFixed(2)}</Split>
      <Split title='Discount'>-${discount.toFixed(2)}</Split>
      <Split title='Items'>
        {totalProducts} ({totalQuantity} pcs)
      </Split>
      {!btn && (
        <Btn className='confirm proceed-btn' onClick={onClick}>
          {btnText}
        </Btn>
      )}
      {btn}
    </div>
  );
}

function Split({ children, title }) {
  return (
    <div className='space-between'>
      <p>{title}</p>
      <p>{children}</p>
    </div>
  );
}
