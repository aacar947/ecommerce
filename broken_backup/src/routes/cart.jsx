import '../styles/cart.css';
import '../styles/splitpage.css';
import useCart from '../hooks/useCart';
import Grid, { Row, Col } from '../components/Grid';
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PageSpinner from '../components/PageSpinner';
import useDebounce from '../hooks/useDebounce';
import Input from '../components/Input';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import useProduct from '../hooks/useProduct';
import useUpdateCart from '../hooks/useUpdateCart';
import useCartAction from '../hooks/useCartAction';
import TotalContainer from '../components/TotalContainer';
import toast from 'react-hot-toast';
import useUser from '../hooks/useUser';
import { slugParser } from '../utils/slugParser';

export default function Cart() {
  const isLoading = useCart((state) => state.isPending);
  const refreshCart = useCart((state) => state.refreshCart);
  const location = useLocation();

  useLayoutEffect(() => {
    // Refresh the cart when the location key changes
    refreshCart();
  }, [location.key]);

  if (isLoading) return <PageSpinner />;

  return (
    <Grid name='cart'>
      <Row>
        <CartList />
        <Col name='checkout-total' className='split-total' isContainer={false}>
          <TotalContainer btn={<CheckoutBtn />} />
        </Col>
      </Row>
      <Row></Row>
    </Grid>
  );
}

function CartList() {
  const products = useCart((state) => state.cart?.products || []);
  return (
    <Col isContainer={false} title='Cart' name='cart-info' className='flex-col split-info'>
      <Col style={{ position: 'relative' }}>
        <div className='wrapper justify-self-center'>
          <h2 id='cart-title'>CART</h2>
          {products.length > 0 ? products.map((product) => <CartProduct key={product.id} product={product} />) : <p>Your cart is empty.</p>}
        </div>
      </Col>
    </Col>
  );
}

function CheckoutBtn() {
  const disabled = useCart((state) => state.cart?.totalProducts === 0);
  const navigate = useNavigate();
  return (
    <Btn disabled={disabled} className='confirm proceed-btn' onClick={() => navigate('/checkout')}>
      PROCEED TO CHECKOUT
    </Btn>
  );
}

const CartProduct = memo(
  function ({ product }) {
    // TODO : Add a loading state
    // TODO : Handle errors
    const { data } = useProduct(product.id);
    const { updateCart, isError } = useUpdateCart();
    const [quantity, setQuantity, cancelDebounce] = useDebounce(Number(product.quantity), 500);
    const clientQuantity = useRef(quantity);
    const serverQuantity = useRef(product.quantity);
    const navigate = useNavigate();
    const handleChange = (e) => setQuantity(Number(e.target.value));

    useEffect(() => {
      if (isError) {
        cancelDebounce(serverQuantity.current);
      }
    }, [isError]);

    useLayoutEffect(() => {
      clientQuantity.current = quantity;
      // Prevent unnecessary API calls
      if (quantity === '' || quantity === serverQuantity.current) return;
      // Update the quantity of the product in the cart
      updateCart([{ id: product.id, quantity }]);
    }, [quantity, updateCart, product.id]);

    useEffect(() => {
      serverQuantity.current = Number(product.quantity);
      // Update the quantity of the product in the cart if the quantity has not updated for any reason
      if (clientQuantity.current !== serverQuantity.current) cancelDebounce(serverQuantity.current);
    }, [product.quantity, cancelDebounce]);

    const price = (product.discountedTotal || product.discountedPrice).toFixed(2);
    const prevPrice = (product.total || product.price || 0).toFixed(2);
    const discountPercentage = product.discountPercentage || 0;
    const url = '/p/' + slugParser.slugify({ title: product.title, id: product.id });

    return (
      <div className='card cart-product flex'>
        <img className='image' onClick={() => navigate(url)} src={product.thumbnail} alt={product.title} />
        <div className='desc'>
          <div className='flex product-info'>
            <span className='product-title text-overflow-ellipsis' onClick={() => navigate(url)}>
              {product.title}
            </span>
            <div className='price-tag'>
              <div className='price-info flex-col'>
                {prevPrice && <span className='prev-price'>${prevPrice}</span>}
                {discountPercentage && <span className='discount'>{discountPercentage.toFixed(2)}%</span>}
                <p className='price-text'>${price}</p>
              </div>
            </div>
          </div>
          <div className='quantity' onClick={(e) => e.stopPropagation()}>
            <Input onChange={handleChange} value={quantity} type='counter' min={1} max={data?.stock || 10}></Input>
          </div>
        </div>
        <DeleteBtn productId={product.id} />
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.product.quantity === nextProps.product.quantity && prevProps.product.id === nextProps.product.id
);

const DeleteBtn = memo(
  function ({ productId }) {
    const isGuest = useUser((s) => s.isGuest);
    const { removeFromCart, isSuccess, isPending } = useCartAction();
    const [confirming, setConfirming] = useState(false);

    const handleDelete = () => {
      if (confirming)
        removeFromCart(productId).then((res) => {
          if (isGuest && res.statusText === 'OK') toast.success('Removed from cart');
        }); // Remove the product from the cart
      setConfirming(!confirming);
    };

    useEffect(() => {
      if (isSuccess && !isPending) {
        toast.success('Removed from cart');
      }
    }, [isSuccess, isPending]);

    return (
      <button onClick={handleDelete} onBlur={() => setConfirming(false)} aria-expanded={confirming} aria-label={confirming ? 'Confirm delete' : 'Delete'} className={'btn-flat delete-btn' + (confirming ? ' active' : '')}>
        <Icon icon='/icons/delete.svg' size='16px' />
        <div className='expandable'>DELETE?</div>
      </button>
    );
  },
  (prevProps, nextProps) => prevProps.productId === nextProps.productId
);
