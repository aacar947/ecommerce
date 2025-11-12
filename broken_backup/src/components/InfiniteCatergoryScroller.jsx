import InfiniteProductsScroller from './InfiniteProductsScroller';
import useProductCategory from '../hooks/useProductCategory';
import { useEffect, useMemo } from 'react';
import NotFound from '../routes/not-found';
import Grid, { Col } from './Grid';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import useSlug from '../hooks/useSlug';
import { useSearchParams } from 'react-router';

export default function InfiniteCategoryScroller() {
  const [params] = useSearchParams();
  const { setCrumbs } = useBreadCrumbs();
  const { title, id } = useSlug();
  const { data, isFetching, fetchNextPage, hasNextPage, limit, isLoading } = useProductCategory(title, params);

  const products = data?.pages?.reduce((acc, { products }) => [...acc, ...products], []) || [];
  const tags = useMemo(() => data?.pages[0]?.tags, [data]);

  useEffect(() => {
    if (products.length === 0 || !title || !id) return;
    setCrumbs([{ title: title?.replaceAll('-', ' ') }]);
  }, [title, id, setCrumbs, products.length]);

  if (!isFetching && products?.length === 0) return <NotFound />;

  const header = (
    <h2 className='title' style={{ textTransform: 'uppercase' }}>
      {title?.replaceAll('-', ' ')}
    </h2>
  );

  return (
    <Grid name='category'>
      <Col name={title?.toLocaleLowerCase()} title={title}>
        <InfiniteProductsScroller title={header} fetchLimit={limit} fetchMore={fetchNextPage} hasMore={hasNextPage} isFetching={isFetching} isLoading={isLoading} products={products} total={data?.pages[0]?.total} tags={tags} />;
      </Col>
    </Grid>
  );
}
