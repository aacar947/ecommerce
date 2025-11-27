import { useEffect, useMemo, useRef, useState, memo } from 'react';
import useSearchStoreProducts from '../../../hooks/useSearchStoreProducts';
import useProductContext from '../../../hooks/useProductContext';
import SearchBar from '../../SearchBar';
import Btn from '../../Btn';
import { PRODUCT_ACTIONS } from '../../../utils/storeActions';
import useDebouncedCallback from '../../../hooks/useDebouncedCallback';
import FlatBtn from '../../FlatBtn';

export default function ProductSearch({ dispatchAction }) {
  const setSelectedProduct = useProductContext((s) => s?.setProduct);
  const [query, setQuery] = useState('');
  const inputRef = useRef();
  const { data, isFetching, fetchNextPage, hasNextPage, limit, reset } = useSearchStoreProducts(new URLSearchParams({ q: query }));

  const products = useMemo(() => data?.pages?.reduce((acc, { products }) => [...acc, ...products], []), [data]);
  const total = data?.pages?.[0]?.total;

  const handleSearch = useDebouncedCallback(
    (e) => {
      const query = e.target.value;
      if (!query || query === '') return;
      dispatchAction(PRODUCT_ACTIONS.idle);
      setQuery(query);
    },
    [dispatchAction, setQuery]
  );

  useEffect(() => {
    if (query === '') {
      reset();
      inputRef.current.value = '';
      return;
    }
    if (query !== '' && products === undefined) fetchNextPage();
  }, [query, reset, fetchNextPage, products === undefined]);

  const handleClearSearch = () => {
    setQuery('');
    setSelectedProduct(null);
    dispatchAction(null);
  };

  return (
    <>
      <>
        <p className='pale'>Search for an existing product to update or delete</p>
        <br />
        <SearchBar autoComplete='off' onChange={handleSearch} ref={inputRef} className='product-search flex' placeholder='Search by name, sku or id'>
          {products !== undefined && <FlatBtn icon='/icons/circled-cross.svg' className='small-btn clear-search-btn' onClick={handleClearSearch} />}
        </SearchBar>
      </>
      <SearchResults total={total} productCount={products?.length} fetchMore={fetchNextPage} hasMore={hasNextPage} fetchLimit={limit} products={products} isFetching={isFetching && query !== ''} />
    </>
  );
}

const MemoizedSearchResults = memo(StoreProductCard, (prev, next) => prev.product?.id === next.product?.id && prev.isSelected === next.isSelected);

function SearchResults({ products, productCount, total, isFetching, fetchMore, hasMore, fetchLimit }) {
  const selected = useProductContext((s) => s?.product);
  if (products === undefined && !isFetching) return null;
  return (
    <div className='store-search-results flex-col'>
      {products?.length === 0 && !isFetching && (
        <p className='pale text-center'>
          <strong>No results found.</strong>
        </p>
      )}
      {products?.map((product) => {
        const isSelected = selected?.id === product?.id;
        return <MemoizedSearchResults key={'store-product-card' + product.id} product={product} isSelected={isSelected} />;
      })}
      {isFetching && [...Array(fetchLimit)].map((_, i) => <StoreProductCardSkeleton key={'__skeleton_card' + i} />)}
      <br />
      {productCount > 0 && (
        <div className='flex center-all'>
          <strong className='pale'>
            {productCount}/{total}
          </strong>
        </div>
      )}
      {hasMore && (
        <div className='flex center-all'>
          <Btn onClick={fetchMore}>Next</Btn>
        </div>
      )}
    </div>
  );
}

function StoreProductCard({ product, isSelected }) {
  const setSelected = useProductContext((s) => s?.setProduct);

  const handleClick = () => {
    if (isSelected) setSelected(null);
    else setSelected(product);
  };
  return (
    <div className={'card store-product-card flex-col' + (isSelected ? ' selected' : '')} onClick={handleClick} tabIndex={0}>
      <div className='image'>
        <img aria-label={product?.title + ' image'} loading='lazy' className='image-contain' src={product?.thumbnail} />
      </div>
      <div className='desc'>
        <p className='pale'>{product?.title}</p>
        <p>{product?.sku}</p>
        <p>
          <span className='pale id-text'>Product ID: </span>
          {product?.id}
        </p>
      </div>
    </div>
  );
}

function StoreProductCardSkeleton() {
  return (
    <div className='card store-product-card flex-col skeleton skeleton-body'>
      <div className='image skeleton-item skeleton-image'></div>
      <div className='desc skeleton-item-fit'>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-200px'></span>
        </p>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-175px'></span>
        </p>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-100px'></span>
        </p>
      </div>
    </div>
  );
}
