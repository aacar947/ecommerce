import '../styles/checkout.css';
import '../styles/splitpage.css';
import Grid, { Row, Col } from '../components/Grid';
import useCart from '../hooks/useCart';
import useUser from '../hooks/useUser';
import PageSpinner from '../components/PageSpinner';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useLayoutEffect } from 'react';
import useAddress from '../hooks/useAddress';
import EditAddressForm from '../components/EditAddressForm';
import TotalContainer from '../components/TotalContainer';
import Form from '../components/Form';
import ProductReviewTable from '../components/ProductReviewTable';

export default function Checkout() {
  const navigate = useNavigate();
  const cartQuantity = useCart((state) => state.cart?.totalQuantity || 0);
  const cartIsPending = useCart((state) => state.isPending);

  useEffect(() => {
    if (cartQuantity <= 0 && !cartIsPending) {
      navigate('/');
    }
  }, [cartQuantity, navigate]);

  const userIsPending = useUser((s) => s.isPending);
  const refreshCart = useCart((state) => state.refreshCart);
  const location = useLocation();

  useLayoutEffect(() => {
    // Refresh the cart when the location key changes
    refreshCart();
  }, [location.key]);

  if (userIsPending || cartIsPending) return <PageSpinner />;
  return (
    <>
      <meta name='description' content='Checkout' />
      <title>Checkout</title>
      <Grid>
        <Row>
          <Col name='checkout-info' className='split-info' isContainer={false}>
            <CartReview />
            <ShippingInfo />
            <PaymentMethod />
          </Col>
          <Col name='checkout-total' className='split-total' isContainer={false}>
            <TotalContainer btnText='pay now' />
          </Col>
        </Row>
      </Grid>
    </>
  );
}

function ShippingInfo() {
  const { address, setAddress } = useAddress();

  return (
    <Col titledBy='shipping-info-title' name='shipping-info'>
      <div className='wrapper justify-self-center'>
        <h2 id='shipping-info-title'>Delivery</h2>
        {!address && (
          <p>
            You have not added an address. Proceed as guest or <Link to='/login'>log-in.</Link>
          </p>
        )}
        <EditAddressForm address={address} setAddress={setAddress} />
      </div>
    </Col>
  );
}

function CartReview() {
  const cart = useCart((state) => state.cart);
  return (
    <Col titledBy='cart-review-title' name='cart-review' className='flex-col'>
      <div className='wrapper justify-self-center'>
        <h2 id='cart-review-title'>Your Cart</h2>
        <ProductReviewTable products={cart?.products} />
      </div>
    </Col>
  );
}

function PaymentMethod() {
  const inputs = [
    { name: 'cardHolder', type: 'text', placeholder: 'Card Holder', required: true },
    { name: 'cardNumber', type: 'card', placeholder: 'Card Number', required: true, size: 'md' },
    { name: 'expirationDate', type: 'expr-date', placeholder: 'Valid Thru', required: true, className: 'input-sm', size: 'max-sm', pattern: '\\d{2}/\\d{2}' },
    { name: 'cvv', type: 'cvv', placeholder: 'CVV', required: true, className: 'input-sm', size: 'max-sm', pattern: '\\d{3}' },
  ];
  return (
    <Col titledBy='payment-method-title' name='payment-method'>
      <div className='wrapper justify-self-center'>
        <h2 id='payment-method-title'>Payment Method</h2>
        <Form inputs={inputs} noBtn />
      </div>
    </Col>
  );
}
