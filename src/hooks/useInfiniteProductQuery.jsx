import { useCallback, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

const LIMIT = 10;

export default function useInfiniteProductQuery(queryFn, searchParams = new URLSearchParams({ limit: LIMIT }), queryKey = []) {
  let params = useParams();
  const limit = parseInt(searchParams.get('limit')) || LIMIT;
  const paramsKey = searchParams.toString();
  const limitRef = useRef(new Map());
  const initialRef = useRef(true);

  const { fetchNextPage, hasNextPage, data, isFetching, refetch, isError, error } = useInfiniteQuery({
    queryKey: ['infinite', paramsKey, params, ...queryKey],
    queryFn: async ({ pageParam: skip }) => {
      const _params = new URLSearchParams(searchParams);
      _params.set('skip', skip);
      if (!_params.has('limit')) _params.set('limit', LIMIT);
      const res = await queryFn(_params);
      const nextSkip = skip + res.limit;
      const next = nextSkip < res.total ? nextSkip : undefined;
      limitRef.current.set(paramsKey, Math.min(res.total - next || 0, limit));
      return {
        ...res,
        nextCursor: next,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes: data is considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour: data stays in memory even if inactive
    initialPageParam: 0,
    enabled: false,
    getNextPageParam: (nextPage) => nextPage.nextCursor,
  });

  useEffect(() => {
    if (data !== undefined && initialRef.current) initialRef.current = false;
  }, [data]);

  const fetchNext = useCallback(
    (options) => {
      if (hasNextPage && !isFetching) fetchNextPage(options);
    },
    [hasNextPage, isFetching, fetchNextPage]
  );

  useEffect(() => {
    // reset BEFORE triggering the new fetch
    if (data === undefined) limitRef.current.delete(paramsKey);
    if (limitRef.current.has(paramsKey)) return;
    limitRef.current.set(paramsKey, limit); // reset limit;
    refetch();
  }, [paramsKey, refetch, data]); // depends on queryKey inputs

  return {
    hasNextPage,
    isFetching,
    isLoading: isFetching && initialRef.current,
    fetchNextPage: fetchNext,
    data,
    isError,
    error,
    limit: limitRef.current.get(paramsKey) || 0,
  };
}
