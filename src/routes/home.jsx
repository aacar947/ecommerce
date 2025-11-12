/* eslint-disable react-refresh/only-export-components */
import { Link, useLoaderData } from 'react-router';
import { getCategories } from '../database/fakeDB';
import Grid, { Col } from '../components/Grid';
import LazyLoadCarousel from '../components/LazyLoadCarousel';
import ShowcaseContainer from '../components/ShowcaseContainer';

let featured = [
  {
    url: 'https://dummyjson.com/products',
    title: 'Featured Products',
    name: 'featured',
  },
  {
    url: 'https://dummyjson.com/products?sortBy=discountPercentage&order=desc',
    title: 'Discounted Items',
    name: 'discounted',
  },
];
export async function loader() {
  const data = await getCategories();
  if (!data) return null;
  const categories = data.map((category, i) => ({
    url: category.url,
    title: (
      <Link className='carousel-title-link' to={`/c/${category.slug}-${i + 1}`}>
        <h2 className='carousel-title underline-hover'>{category.name}</h2>
      </Link>
    ),
    name: category.slug,
  }));
  return [...featured, ...categories];
}
export default function Home() {
  const data = useLoaderData();
  return (
    <>
      <meta name='description' content='Home' />
      <title>Ecommerce | Home</title>
      <Grid name='home'>
        <Col name='showcase'>
          <ShowcaseContainer />
        </Col>
        <LazyLoadCarousel url='https://dummyjson.com/products/category' carousels={data} />
      </Grid>
    </>
  );
}

export const handle = {
  displayQuickNav: true,
};
