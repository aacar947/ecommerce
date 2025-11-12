import { CarouselRowSkeleton } from '../components/LazyLoadCarousel';
import { ShowcaseContainerSkeleton } from '../components/ShowcaseContainer';
import Grid, { Col } from '../components/Grid';
export default function HomeSkeleton() {
  return (
    <Grid name='home'>
      <Col>
        <ShowcaseContainerSkeleton />
      </Col>
      <CarouselRowSkeleton />
    </Grid>
  );
}
