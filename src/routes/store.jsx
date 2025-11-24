import '../styles/store.css';
import '../styles/orders.css';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import useStoreOrders from '../hooks/useStoreOrders';
import { useSearchParams } from 'react-router';
import Grid, { Row, Col } from '../components/Grid';
import OrderList from '../components/OrderList';
import Icon from '../components/Icon';
import Select, { Option } from '../components/Select';
import Btn from '../components/Btn';
import ProductProvider from '../contexts/ProductProvider';
import useProductContext from '../hooks/useProductContext';
import api from '../utils/api';
import { initialActionState, PRODUCT_ACTIONS, productActionsReducer } from '../utils/storeActions';
import ProductSearch from '../components/pages/store/ProductSearch';
import UpdateProduct from '../components/pages/store/UpdateProduct';

export default function Store() {
  const [content, setContent] = useState({ title: 'Orders', value: 'orders' });
  const [params, setParams] = useSearchParams();
  const tabs = useRef([
    { title: 'Orders', icon: '/icons/sales.svg', value: 'orders' },
    { title: 'Products', icon: '/icons/add-product.svg', value: 'products' },
  ]);

  const setPageContent = useCallback(
    (newContent) => {
      let index = tabs.current.findIndex((tab) => tab.value === newContent);
      const newParams = new URLSearchParams(params);
      if (index === -1) index = 0;
      if (index === 0 && params.has('tab')) {
        newParams.delete('tab');
        setParams(newParams, { replace: true });
      }
      if (index > 0 && !params.has('tab', newContent)) {
        newParams.set('tab', newContent);
        setParams(newParams, { replace: true });
      }
      setContent(tabs.current[index]);
    },
    [setContent, params, setParams]
  );

  useEffect(() => {
    const tab = params.get('tab');
    if (tab) setPageContent(tab);
    if (!params.has('tab')) setContent(tabs.current[0]);
  }, [params, setPageContent, setContent]);

  return (
    <Grid>
      <Row name='store-row'>
        <Col name='store-content' title='Store Content'>
          <Tabs tabs={tabs.current} content={content} setContent={setPageContent} />
          <h2 className='content-title'>{content.title}</h2>
          {content.value === 'orders' && <OrdersTab />}
          {content.value === 'products' && <ProductsTab />}
        </Col>
      </Row>
    </Grid>
  );
}

function Tabs({ tabs, content, setContent }) {
  const handleChange = (e) => {
    setContent(e.target.value);
  };
  return (
    <div className='store-dashboard'>
      <div className='tabs'>
        <Select name='tabs' onChange={handleChange} icon='/icons/arrow-down.svg' defaultValue={content.value}>
          {tabs.map((props, i) => (
            <TabOption key={props.title + i} {...props} />
          ))}
        </Select>
        <ul className='tabs-list flex'>
          {tabs.map((props, i) => {
            return <TabItem active={props.value === content.value} key={i} {...props} setContent={setContent} />;
          })}
        </ul>
      </div>
    </div>
  );
}

function TabOption({ title, icon, value }) {
  return (
    <Option value={value}>
      <Icon icon={icon} />
      <span>{title}</span>
    </Option>
  );
}

function TabItem({ title, icon, active, value, setContent, ...props }) {
  return (
    <li {...props} className={'tabs-list-item flex' + (active ? ' active' : '')} onClick={() => setContent(value)}>
      <Icon icon={icon} />
      <span>{title}</span>
    </li>
  );
}

function OrdersTab() {
  const [params, setParams] = useState(new URLSearchParams());
  const { data, fetchNextPage, hasNextPage, limit, isFetching } = useStoreOrders(params);
  const orders = data?.pages.reduce((acc, { orders }) => [...acc, ...orders], []);
  return (
    <>
      <meta name='description' content='Orders' />
      <title>Store | Orders</title>
      <OrderList orders={orders} isFetching={isFetching} hasNextPage={hasNextPage} limit={limit} fetchNextPage={fetchNextPage} params={params} setParams={setParams} />
    </>
  );
}

function ProductsTab() {
  return (
    <>
      <meta name='description' content='Store | Products' />
      <title>Store | Products</title>
      <div className='store-products flex-col center-all'>
        <ProductProvider>
          <ProductsTabActions />
        </ProductProvider>
      </div>
    </>
  );
}

function ProductsTabActions() {
  const [action, dispatchAction] = useReducer(productActionsReducer, initialActionState);
  const setSelectedProduct = useProductContext((s) => s?.setProduct);
  const selectedProduct = useProductContext((s) => s?.product);

  useEffect(() => {
    if (selectedProduct) dispatchAction(PRODUCT_ACTIONS.update);
  }, [selectedProduct, dispatchAction]);

  useEffect(() => {
    if (action.type !== PRODUCT_ACTIONS.update && action.type !== PRODUCT_ACTIONS.idle) setSelectedProduct(null);
  }, [setSelectedProduct, action]);

  return (
    <>
      <ProductActionButtons action={action} dispatchAction={dispatchAction} />
      <UpdateProduct action={action} />
    </>
  );
}

function ProductActionButtons({ action, dispatchAction }) {
  return (
    <>
      <ProductSearch dispatchAction={dispatchAction} />
      {!action.type && (
        <>
          <hr className='pale' data-label='or' />
          <p className='pale'>You can add a new product</p>
          <Btn className='action-btn' onClick={() => dispatchAction(PRODUCT_ACTIONS.add)}>
            Add Product
          </Btn>
        </>
      )}
    </>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const productId = formData.get('productId');
  formData.delete('productId');
  const data = Object.fromEntries(formData);
  if (data.images) data.images = formData.getAll('images');

  if (productId) {
    const res = await api.updateProduct(productId, data).catch(console.log);
    return res?.status === 200 ? { data: res.data, error: false, action: 'updated' } : { error: true, data: null, action: 'updated' };
  }

  const res = await api.createProduct(data).catch(console.log);
  return res?.status === 201 ? { data: res.data, error: false, action: 'added' } : { error: true, data: null, action: 'added' };
}
