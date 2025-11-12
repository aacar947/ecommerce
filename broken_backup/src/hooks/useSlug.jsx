import { useMemo } from 'react';
import SlugParser, { slugPattern } from '../utils/slugParser';
import { useParams } from 'react-router';

export default function useSlug() {
  const { slug } = useParams();
  const parser = useMemo(() => new SlugParser(slugPattern), [slugPattern]);
  return useMemo(() => parser.parse(slug), [parser, slug]);
}
