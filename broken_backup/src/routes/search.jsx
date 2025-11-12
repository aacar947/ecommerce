import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import useSearchQuery from '../hooks/useSearchQuery';
import InfiniteProductsScroller from '../components/InfiniteProductsScroller';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import Grid, { Col } from '../components/Grid';
import Icon from '../components/Icon';
import NotFound from './not-found';

export default function Search() {
  const { setCrumbs } = useBreadCrumbs();
  const [params] = useSearchParams();
  const { data, isFetching, fetchNextPage, hasNextPage, limit, isLoading } = useSearchQuery(params);
  const title = params.get('q');

  const products = useMemo(() => data?.pages.reduce((acc, { products }) => [...acc, ...products], []), [data]);
  // the tags are not from the API and are artificial
  // because the API doesn't support tags for search queries
  const tags = useMemo(() => data?.pages[0]?.tags, [data]);

  useEffect(() => {
    if (!title) return;
    setCrumbs([
      {
        title: 'Search for ' + title?.replaceAll('-', ' '),
        element: (
          <span>
            <Icon size='1em' icon='/icons/search.svg' />
            {title?.replaceAll('-', ' ')}
          </span>
        ),
      },
    ]);
  }, [title]);

  if (!title) return <NotFound />;

  return (
    <Grid name='search'>
      <Col name='search-info' title={title}>
        <InfiniteProductsScroller
          title={`Results for "${title}"`}
          fetchLimit={limit}
          fetchMore={fetchNextPage}
          hasMore={hasNextPage}
          isFetching={isFetching || data === undefined}
          isLoading={isLoading}
          products={products}
          total={data?.pages[0]?.total}
          tags={tags}
        />
      </Col>
    </Grid>
  );
}

export const handle = {
  displayQuickNav: true,
};
