import React from 'react';
import useObserver from '../hooks/useObserver';
import ProductCard from './ProductCard';
import Carousel, { CarouselSkeleton } from './Carousel';
import { Row, Col } from './Grid';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ProductCardSkeleton } from './ProductCard';
import { Link } from 'react-router';

export default function LazyLoadCarousel({ url = '/', carousels = [] }) {
  const [ref, entry] = useObserver({ threshold: 0 });

  const { hasNextPage, isFetchingNextPage, fetchNextPage, data } = useInfiniteQuery({
    queryKey: ['infinite', url, carousels?.map((c) => c.name)],
    queryFn: ({ pageParam }) => {
      const { name, title } = carousels[pageParam];
      const _url = carousels[pageParam]?.url || url;
      const query = carousels[pageParam]?.query ? `?${carousels[pageParam].query}` : '';
      const params = carousels[pageParam]?.params || '';

      return fetch(_url + params + query)
        .then((res) => res.json())
        .then((json) => json.products)
        .then((products) => {
          return {
            name,
            title,
            products,
            nextCursor: pageParam < carousels.length - 1 ? pageParam + 1 : undefined,
            prevCursor: pageParam > 0 ? pageParam - 1 : undefined,
          };
        });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes: data is considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour: data stays in memory even if inactive
    initialPageParam: 0,
    getNextPageParam: (nextPage) => nextPage.nextCursor,
    getPreviousPageParam: (prevPage) => prevPage.prevCursor,
  });

  React.useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      {data?.pages.length > 0 && data.pages.map((carousel, i) => <CarouselRow key={'carousel' + i} carousel={carousel} />)}
      {<CarouselRowSkeleton hidden={!isFetchingNextPage} />}
      <div className='intersection-observer' ref={ref} />
    </>
  );
}

const CarouselRow = React.memo(
  ({ carousel }) => {
    if (carousel.products.length === 0) return null;
    const id = '' + carousel.name + '-title';
    return (
      <Row key={carousel.name}>
        <Col titledBy={id} name={carousel.name}>
          {typeof carousel.title === 'string' && (
            <h2 className='carousel-title' id={id}>
              {carousel.title}
            </h2>
          )}
          {React.isValidElement(carousel.title) && carousel.title}
          <Carousel>
            {carousel.products?.map((product) => {
              if (!product) return null;
              return (
                <Carousel.Item key={product?.id}>
                  <ProductCard product={product} />
                </Carousel.Item>
              );
            })}
          </Carousel>
        </Col>
      </Row>
    );
  },
  (prev, next) => prev.carousel.name === next.carousel.name
);

export function CarouselRowSkeleton({ hidden }) {
  return (
    <>
      <Row style={{ display: hidden ? 'none' : 'flex' }}>
        <Col>
          <div className='carousel-title skeleton-item skeleton-item-large skeleton-item-200px'></div>
          <CarouselSkeleton repeat={5}>
            <ProductCardSkeleton />
          </CarouselSkeleton>
        </Col>
      </Row>
    </>
  );
}
