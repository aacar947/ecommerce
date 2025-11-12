import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import useOrderStatusList from '../hooks/useOrderStatusList';
import useFilterValidation from '../hooks/useFilterValidation';
import useObserver from '../hooks/useObserver';
import { statusIcons } from '../utils/statusIcons';
import Icon from '../components/Icon';
import SearchBar from '../components/SearchBar';
import Toggle from '../components/Toggle';

const MemoizedOrder = memo(Order, (prev, next) => prev.order.id === next.order.id);

export default function OrderList({ orders, isFetching, hasNextPage, limit, fetchNextPage, params, setParams }) {
  const [observerRef] = useObserver({
    onIntersect: fetchNextPage,
    threshold: 1,
    rootMargin: '400px',
  });

  const Skeleton = useMemo(() => {
    return [...Array(limit || 0)].map((_, i) => <OrderSkeleton key={'skeleton-item-' + i} />);
  }, [limit]);

  return (
    <>
      <OrderFilters params={params} setParams={setParams} />
      {orders?.length === 0 ? (
        <NoOrder />
      ) : (
        <>
          {orders?.map((order) => {
            if (!order) return null;
            const id = 'order-' + order.id;
            return <MemoizedOrder key={id} order={order} />;
          })}
        </>
      )}
      {isFetching && Skeleton}
      {hasNextPage && <div ref={observerRef} className='observer'></div>}
    </>
  );
}

function Order({ order }) {
  const { id: orderId, status, orderedAt, discountedTotal } = order;
  const date = new Date(orderedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const id = 'order-' + orderId;
  const navigate = useNavigate();

  return (
    <div className='order-card' key={id} aria-label={id} onClick={() => navigate('/orders/details/' + orderId)}>
      <div className='order-header flex'>
        <div className='order-header-item order-images flex'>
          <div className='order-images-body flex'>
            {order?.products?.map(({ thumbnail, title, id: productId }) => (
              <div className='image' key={'image-' + productId}>
                <img className='image-contain' src={thumbnail} aria-label={title} />
              </div>
            ))}
          </div>
        </div>
        <div className='order-header-item order-id'>
          <span className='order-id-label'>Order Number:</span>
          <span>{orderId}</span>
        </div>
        <div className='order-header-item order-status'>
          <div className={'status-container' + (status ? ' status-' + status.toLowerCase() : '')}>
            <Icon icon={statusIcons[status] || '/icons/pending.svg'} />
          </div>
          <span>{status}</span>
        </div>
        <div className='order-header-item order-total flex-col'>
          <strong>{date}</strong>
          <span>${discountedTotal}</span>
        </div>
      </div>
      <div className='right-arrow-icon'>
        <Icon icon='/icons/arrow-right.svg' />
      </div>
    </div>
  );
}

function OrderFilters({ params, setParams }) {
  const { isValidChange } = useFilterValidation();
  const handleChange = (e) => {
    const newParams = new URLSearchParams(params);
    if (isValidChange(e.target) && e.target.value !== '' && e.target.value !== 'all') newParams.set(e.target.name, e.target.value);
    else newParams.delete(e.target.name);

    setParams(newParams, { replace: true });
  };

  const { data } = useOrderStatusList();
  const FilterByOptions = useMemo(() => {
    if (!data) return [];
    return ['All', ...data];
  }, [data]);

  return (
    <div className='order-filters'>
      <OrderSearch params={params} setParams={setParams} />
      <ul className='filter-by-list' onChange={handleChange}>
        {FilterByOptions?.map((option) => (
          <FilterByOption key={'option-' + option} value={option.toLocaleLowerCase()} params={params} />
        ))}
      </ul>
    </div>
  );
}

function OrderSearch({ params, setParams }) {
  const inputRef = useRef();
  useEffect(() => {
    const paramValue = params.get('q');
    if (paramValue) inputRef.current.value = paramValue;
  }, [params]);

  const handleChange = (e) => {
    if (e.target.value === '') {
      const newParams = new URLSearchParams(params);
      newParams.delete('q');
      setParams(newParams, { replace: true });
    }
  };

  const handleSubmit = () => {
    const newParams = new URLSearchParams(params);
    newParams.set('q', inputRef.current.value);
    setParams(newParams, { replace: true });
  };

  return <SearchBar ref={inputRef} className='order-searchbar' name='q' onSubmit={handleSubmit} onChange={handleChange} />;
}

function FilterByOption({ value, params }) {
  const inputRef = useRef();

  useEffect(() => {
    const paramValue = params.get('filterBy');
    if (paramValue && paramValue === value) inputRef.current.checked = true;
    if (!paramValue && value === 'all') inputRef.current.checked = true;
  }, [params, value]);
  return (
    <li>
      <Toggle ref={inputRef} title={value} type='radio' name='filterBy' value={value} />
    </li>
  );
}

function NoOrder() {
  return (
    <div className='no-order'>
      <strong>No orders found.</strong>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className='order-card skeleton-body'>
      <div className='order-header flex'>
        <div className='order-header-item order-images'>
          <div className='image skeleton-image skeleton-item'></div>
          <div className='image skeleton-image skeleton-item'></div>
        </div>
        <div className='order-header-item order-id'>
          <div className='skeleton-item skeleton-item-200px skeleton-item-large'></div>
        </div>
        <div className='order-header-item order-status'>
          <div className='status-container skeleton-item skeleton-item-200px skeleton-item-large'></div>
        </div>
        <div className='order-header-item order-total flex-col'>
          <div className='skeleton-item skeleton-item-175px skeleton-item-medium'></div>
          <div className='skeleton-item skeleton-item-100px skeleton-item-medium'></div>
        </div>
      </div>
      <div className='right-arrow-icon'>
        <Icon icon='' />
      </div>
    </div>
  );
}
