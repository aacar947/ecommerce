import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import InfiniteProductsScroller from '../components/InfiniteProductsScroller';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import Grid, { Col } from '../components/Grid';
import useInfiniteProductQuery from '../hooks/useInfiniteProductQuery';
import api from '../utils/api';
import useUser from '../hooks/useUser';
import Icon from '../components/Icon';

export default function Wishlist() {
  const { setCrumbs } = useBreadCrumbs();
  const [params] = useSearchParams();
  const userId = useUser((s) => s.user?.id);
  const { data, isFetching, fetchNextPage, hasNextPage, limit, isLoading } = useInfiniteProductQuery(() => api.getWishlist(userId), params);
  const title = (
    <>
      <h2 className='title flex align-items-center'>
        <Icon size='1em' icon='/icons/heart-filled.svg' />
        <span style={{ marginLeft: '4px' }}>Wishlist</span>
      </h2>
    </>
  );

  useEffect(() => {
    setCrumbs([
      {
        title: 'Wishlist',
        element: (
          <span>
            <Icon size='1em' icon='/icons/heart-filled.svg' />
            {'Wishlist'}
          </span>
        ),
      },
    ]);
  }, [setCrumbs]);

  const products = useMemo(
    () =>
      data?.pages.reduce((acc, { products }) => {
        products.forEach((product) => (product.isWishlisted = true));
        return [...acc, ...products];
      }, []),
    [data]
  );
  // the tags are not from the API and are artificial
  // because the API doesn't support tags for search queries
  const tags = useMemo(() => data?.pages[0]?.tags, [data]);

  return (
    <Grid name='search'>
      <Col name='search-info' title='wishlist'>
        <InfiniteProductsScroller title={title} fetchLimit={limit} fetchMore={fetchNextPage} hasMore={hasNextPage} isFetching={isFetching} isLoading={isLoading} products={products} total={data?.pages[0]?.total} tags={tags} />
      </Col>
    </Grid>
  );
}

export const handle = {
  displayQuickNav: true,
};
