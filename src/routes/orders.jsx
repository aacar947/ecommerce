import '../styles/orders.css';
import useOrders from '../hooks/useOrders';
import Grid, { Col, Row } from '../components/Grid';
import { useEffect, useState } from 'react';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import OrderList from '../components/OrderList';

export default function Orders() {
  const { setCrumbs } = useBreadCrumbs();
  const [params, setParams] = useState(new URLSearchParams());
  const { data, fetchNextPage, hasNextPage, limit, isFetching } = useOrders(params);
  const orders = data?.pages.reduce((acc, { orders }) => [...acc, ...orders], []);

  useEffect(() => {
    setCrumbs([
      {
        title: 'Orders',
      },
    ]);
  }, [setCrumbs]);

  return (
    <>
      <meta name='description' content='Orders' />
      <title>My Orders</title>
      <Grid name='orders'>
        <Row>
          <Col name={'orders-list'} title='Orders'>
            <h2>My Orders</h2>
            <OrderList orders={orders} isFetching={isFetching} hasNextPage={hasNextPage} limit={limit} fetchNextPage={fetchNextPage} params={params} setParams={setParams} />
          </Col>
        </Row>
      </Grid>
    </>
  );
}

export const handle = {
  displayQuickNav: true,
};
