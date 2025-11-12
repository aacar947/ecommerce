import { useParams } from 'react-router';
import InfiniteCategoryScroller from '../components/InfiniteCatergoryScroller';
import { slugParser } from '../utils/slugParser';
import NotFound from './not-found';

export default function CategoriesName() {
  const { slug } = useParams();
  const isValidSlug = slugParser.test(slug);
  if (!isValidSlug) return <NotFound />;
  return <InfiniteCategoryScroller />;
}

export const handle = {
  displayQuickNav: true,
};
