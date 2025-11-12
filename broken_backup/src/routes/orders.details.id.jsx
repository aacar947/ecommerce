import '../styles/orders.details.css';
import '../styles/orders.css';
import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import useOrder from '../hooks/useOrder';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import useModal from '../hooks/useModal';
import Grid, { Row, Col } from '../components/Grid';
import PageSpinner from '../components/PageSpinner';
import ProductReviewTable from '../components/ProductReviewTable';
import FlatBtn from '../components/FlatBtn';
import Icon from '../components/Icon';
import { statusIcons } from '../utils/statusIcons';
import ProductReviewModal from '../components/ProductReviewModal';
import { slugParser } from '../utils/slugParser';
import useUser from '../hooks/useUser';

export default function OrderDetails() {
  const params = useParams();
  const { data: order, isLoading } = useOrder(params.id);
  const { setCrumbs } = useBreadCrumbs();
  const userId = useUser((s) => s?.user?.id);
  const isAdmin = useUser((s) => s?.isAdmin);

  useEffect(() => {
    const isNotOwner = order?.userId !== userId && isAdmin;
    const title = isNotOwner ? 'Store' : 'Orders';
    const to = isNotOwner ? '/store' : '/orders';
    setCrumbs([
      {
        title,
        to,
      },
      {
        title: 'Order Details',
      },
    ]);
  }, [order?.userId, userId, setCrumbs, isAdmin]);

  if (order && order.userId !== userId && !isAdmin) return <Navigate to='/orders' replace />;

  return (
    <Grid>
      <Row>
        <Col name='order-details' title='Order Details'>
          <h2>Order Details</h2>
          {isLoading && <PageSpinner />}
          {order && !isLoading && <Order order={order} />}
          {order && !isLoading && <OrderInfo order={order} />}
        </Col>
      </Row>
    </Grid>
  );
}

function Order({ order }) {
  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'long' };
  const date = new Date(order.orderedAt).toLocaleDateString(undefined, dateOptions);
  const lastUpdate = new Date(order.updatedAt).toLocaleDateString(undefined, dateOptions);
  const isAdmin = useUser((s) => s?.isAdmin);

  return (
    <>
      <div className='order-details-header'>
        <div className='pale'>
          <span>Order Number:</span>
          <strong>{order?.id}</strong>
          <br />
          <span className='order-grid-item-value'>{date}</span>
        </div>
      </div>
      <div className='order-grid flex'>
        <div className='order-grid-item order-products'>
          <h3 className='product-header'>Products</h3>
          <p className='pale'>
            {order?.totalQuantity || 0} {order?.totalQuantity > 1 ? 'items' : 'item'}
          </p>
          <Products products={order?.products} />
        </div>
        <div className={'order-grid-item order-grid-status' + (order.status ? ' status-' + order.status.toLowerCase() : '')}>
          <h3>Order Status</h3>
          <div className='flex order-status'>
            <div className={'status-container' + (order.status ? ' status-' + order.status.toLowerCase() : '')}>
              <Icon icon={statusIcons[order.status] || '/icons/pending.svg'} />
            </div>
            <div className='status-update'>
              <strong>{order.status}</strong>
              <span className='pale'>{lastUpdate}</span>
            </div>
          </div>
          <hr />
          <div className='btn-group'>
            {!isAdmin && (
              <>
                <FlatBtn className='action-btn' icon='/icons/return.svg' iconSize='32px'>
                  Return Item
                </FlatBtn>
              </>
            )}
            <FlatBtn className='action-btn' icon='/icons/track.svg' iconSize='32px'>
              Track Package
            </FlatBtn>
            {isAdmin && (
              <>
                <FlatBtn className='action-btn' icon='/icons/stock.svg' iconSize='32px'>
                  Accept Order
                </FlatBtn>
                <FlatBtn className='action-btn' icon='/icons/bold-cross.svg' iconSize='32px'>
                  Reject Order
                </FlatBtn>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OrderInfo({ order = {} }) {
  const fullAddress = order.address;
  const billingAddress = order.billingAddress;
  return (
    <div className='order-grid flex'>
      <div className='order-grid-item order-grid-address'>
        <div className='address-wrapper'>
          <h3>Shipping Address</h3>
          <AddressContainer address={fullAddress} />
        </div>
        <div className='address-wrapper'>
          <h3>Billing Address</h3>
          <AddressContainer address={billingAddress} />
        </div>
      </div>
      <PaymentInfo order={order} />
    </div>
  );
}

function PaymentInfo({ order = {} }) {
  const { total, discountedTotal, paymentIssuer, paymentNetwork, paymentMethod, shippingCost } = order;
  const discount = total - discountedTotal;
  return (
    <div className='order-grid-item order-grid-payment'>
      <h3>Payment</h3>
      <div className='payment-container'>
        <p>
          <strong className='pale'>${(discountedTotal || total).toFixed(2)}</strong>
        </p>

        <p>{order.cardNumber}</p>
        <p className='pastel'>{paymentMethod === 'credit' ? paymentNetwork : paymentIssuer}</p>

        <p className='pale'>{'Payed via ' + (paymentMethod === 'credit' ? 'Credit Card' : 'Debit Card')}</p>
      </div>
      <hr />
      <div className='order-summary'>
        <div className='space-between pale'>
          <span>Subtotal</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
        <div className='space-between pale'>
          <span>Shipping:</span>
          <strong>{shippingCost > 0 ? '$' + shippingCost.toFixed(2) : 'Free'}</strong>
        </div>
        <div className='space-between pale'>
          <span>Discount:</span>
          <strong>{discount > 0 ? '-$' + discount.toFixed(2) : '$0.00'}</strong>
        </div>
        <div className='space-between'>
          <strong className='pastel'>Total:</strong>
          <strong>${(discountedTotal || total).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

function AddressContainer({ address = {} }) {
  return (
    <div className='address-container pastel'>
      <strong>{address.name}</strong>
      <p>{address.address}</p>
      <p>
        <span>
          {address.city}, {address.state}
        </span>
      </p>
      <p>
        <span>{address.postalCode}</span>
        <span>, {address.country}</span>
      </p>
      <p>{address.phone}</p>
    </div>
  );
}

function Products({ products = [] }) {
  const navigate = useNavigate();
  const handleHeaderClick = (product) => {
    const slug = slugParser.slugify({ id: product.id, title: product.title });
    navigate(`/p/${slug}`);
  };
  return (
    <ProductReviewTable products={products} onHeaderClick={handleHeaderClick}>
      {(product) => {
        if (!product) return null;
        return <ProductReviewRow productId={product.id} />;
      }}
    </ProductReviewTable>
  );
}

function ProductReviewRow({ productId }) {
  const [_, setOpen] = useModal({ Component: ProductReviewModal, props: { productId } });
  const isAdmin = useUser((s) => s?.isAdmin);

  if (isAdmin) return null;
  return (
    <tr>
      <td>
        <FlatBtn className='review-btn' onClick={() => setOpen(true)}>
          Review
        </FlatBtn>
      </td>
    </tr>
  );
}

export const handle = {
  displayQuickNav: true,
};
