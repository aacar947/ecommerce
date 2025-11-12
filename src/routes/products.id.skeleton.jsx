import { ImageViewerSkeleton } from '../components/ImageViewer';
import Grid, { Row, Col } from '../components/Grid';
import '../styles/product.id.css';
export default function ProductsSkeleton() {
  return (
    <Grid name='product'>
      <Row className='product-info'>
        <Col name='product-image' className='flex-col'>
          <ImageViewerSkeleton />
        </Col>
        <Col name='product-desc'>
          <div className='skeleton-item skeleton-item-large skeleton-item-300px'></div>
          <div className='skeleton-item skeleton-item-200px'></div>
          <div className='skeleton-item skeleton-item-200px'></div>
          <div className='skeleton-item skeleton-item-xxl'></div>
          <div className='skeleton-item skeleton-item-200px'></div>
          <div className='skeleton-item skeleton-item-175px'></div>
          <br />
          <div className='price skeleton-item skeleton-item-large skeleton-item-100px'></div>
          <br />
          <Row>
            <div className='skeleton-item skeleton-item-xl skeleton-item-200px'></div>
            <div className='skeleton-item skeleton-item-xl skeleton-item-200px'></div>
          </Row>
          <br />
          <hr />
          <Row name='product-reviews'>
            <div className='skeleton-item skeleton-item-large skeleton-item-200px'></div>
            <div className='skeleton-item skeleton-item-h-200px'></div>
          </Row>
        </Col>
      </Row>
    </Grid>
  );
}
