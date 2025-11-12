/* eslint-disable react-refresh/only-export-components */
import '../styles/product.id.css';
import api from '../utils/api';
import { useLoaderData, Navigate, useNavigate } from 'react-router';
import ImageViewer from '../components/ImageViewer';
import StarRating from '../components/StarRating';
import Grid, { Row, Col } from '../components/Grid';
import PriceTag from '../components/PriceTag';
import TextWithIcon from '../components/TextWithIcon';
import Collapsible from '../components/Collapsible';
import ReviewBox from '../components/ReviewBox';
import LazyLoadCarousel from '../components/LazyLoadCarousel';
import useCartAction from '../hooks/useCartAction';
import FlatBtn from '../components/FlatBtn';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { slugParser } from '../utils/slugParser';
import useBreadCrumbs from '../hooks/useBreadCrumbs';

export default function Products() {
  const product = useLoaderData();
  const { setCrumbs } = useBreadCrumbs();

  if (!product) return <Navigate to='/' replace />;
  const navigate = useNavigate();

  useEffect(() => {
    const titleSlug = slugParser.slugify({ title: product?.title, id: product?.id });
    const categorySlug = slugParser.slugify({ title: product?.category, id: 1 });
    const url = `/p/${titleSlug}`;
    navigate(url, { replace: true });
    setCrumbs([{ title: product?.category.replace(/-+/g, ' '), to: `/c/${categorySlug}` }, { title: product?.title }], url);
  }, [product.id, product.title, product.category, navigate, setCrumbs]);

  const relatedProducts = [
    {
      url: `https://dummyjson.com/products/category/${product.category}`,
      title: 'Related Products',
      name: `related-${product.id}`,
    },
  ];

  return (
    <Grid name='product'>
      <Row className='product-info'>
        <Col title='Product Image' name='product-image' className='flex-col'>
          <ImageViewer className='justify-self-center' images={product?.images} />
        </Col>
        <Col titledBy={'product-title'} name='product-desc'>
          <h2 id='product-title'>{product?.title}</h2>
          {product.brand && <TextWithIcon icon='/icons/brand.svg'>{product?.brand}</TextWithIcon>}
          <StarRating rating={product?.rating} />
          <Collapsible maxHeight={100} className='desc' title='Description' icon='/icons/description.svg'>
            {product?.description}
          </Collapsible>
          <TextWithIcon icon='/icons/shipping.svg' pClassName='pale'>
            {product?.shippingInformation}
          </TextWithIcon>
          <TextWithIcon icon='/icons/stock.svg'>{product?.stock} in stock</TextWithIcon>
          <br />
          <PriceTag product={product} />
          <br />
          <Row>
            <AddToCartButton productId={product.id} />
            <FlatBtn className='btn-flat btn-large' icon='/icons/heart.svg' />
          </Row>
          <br />
          <hr />
          <Row name='product-reviews'>
            <h3>Reviews</h3>
            <div className='reviews'>{product.reviews?.length > 0 ? product.reviews.map((review, i) => <ReviewBox review={review} key={i} />) : 'No reviews yet.'}</div>
          </Row>
        </Col>
      </Row>
      <LazyLoadCarousel carousels={relatedProducts} />
    </Grid>
  );
}

function AddToCartButton({ productId }) {
  const { addToCart, isPending, isSuccess } = useCartAction();

  useEffect(() => {
    if (isSuccess && !isPending) {
      toast.success('Added to cart');
    }
  }, [isSuccess, isPending]);

  return (
    <button className='btn confirm large' disabled={isPending} onClick={() => addToCart(productId, 1)}>
      ADD TO CART
    </button>
  );
}

export async function loader({ params }) {
  if (!slugParser.test(params.slug)) return;
  const { id } = slugParser.parse(params.slug);
  try {
    const product = await api.getProduct(id);
    return product;
  } catch (error) {
    console.error('Error fetching product on loader:', error);
  }
}

export const handle = {
  displayQuickNav: true,
};
