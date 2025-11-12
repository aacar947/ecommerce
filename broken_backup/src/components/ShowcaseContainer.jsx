import '../styles/showcase.css';
import '../styles/skeleton.css';
import Carousel from './Carousel';
import useShowcase from '../hooks/useShowcase';
import Btn from './Btn';
import { useNavigate } from 'react-router';
import useObserver from '../hooks/useObserver';
import { slugParser } from '../utils/slugParser';

export default function ShowcaseContainer() {
  const { data: showcase, isLoading } = useShowcase();

  if (isLoading || showcase === undefined) return <ShowcaseContainerSkeleton />;

  return (
    <div className='showcase-container flex'>
      {showcase &&
        showcase.map((element, i) => {
          if (Array.isArray(element)) return <ShowcaseCarousel key={'showcase-element-' + i} items={element} />;

          return <ShowCaseElement key={'showcase-element-' + i} element={element} className='showcase-product flex' btnText='Buy Now' />;
        })}
    </div>
  );
}

function ShowcaseCarousel({ items, parentRef }) {
  return (
    <Carousel className='showcase-carousel' isSlider>
      {items.map((item, i) => {
        return <ShowcaseCarouselItem key={'showcase-item-' + i} item={item} parentRef={parentRef} />;
      })}
    </Carousel>
  );
}

function ShowcaseCarouselItem({ item }) {
  const [ref, entry] = useObserver({ rootMargin: '50px' });

  return (
    <Carousel.Item className={'showcase-carousel-item' + (entry?.isIntersecting ? ' active' : '')}>
      <ShowCaseElement element={item} className='showcase-carousel-card flex' />
      <div className='observer' ref={ref}></div>
    </Carousel.Item>
  );
}

function ShowCaseElement({ element, className, btnText = 'Shop Now' }) {
  if (!element || !element.title) return null;

  const navigate = useNavigate();
  const handleClick = () => {
    if (element.productId) {
      const url = '/p/' + slugParser.slugify({ title: element.title, id: element.productId });
      navigate(url);
    } else navigate(`/search?${element.params}`);
  };

  return (
    <div className={className}>
      <div className='showcase-content flex-col'>
        <h3 className='showcase-title'>{element.title}</h3>
        {element.description && <p className='showcase-desc'>{element.description}</p>}
        <Btn className='showcase-btn white' onClick={handleClick}>
          <span>{btnText}</span>
        </Btn>
      </div>
      <div className='showcase-image flex'>
        <img loading='lazy' aria-label={element.title + ' image'} src={element.image} />
      </div>
    </div>
  );
}

export function ShowcaseContainerSkeleton() {
  return (
    <div className='flex showcase-container skeleton'>
      <div className='carousel-wrapper flex'>
        <div className='carousel-container'>
          <div className='carousel-body showcase-carousel skeleton-body'>
            <div className='carousel-item showcase-carousel-item'>
              <ElementSkeleton className='showcase-carousel-card flex skeleton-item-fit' desc />
            </div>
          </div>
        </div>
      </div>
      <ElementSkeleton className='showcase-product' />
      <ElementSkeleton className='showcase-product' />
      <ElementSkeleton className='showcase-product' />
      <ElementSkeleton className='showcase-product' />
    </div>
  );
}

function ElementSkeleton({ className, desc }) {
  return (
    <div className={className + ' flex skeleton skeleton-body'}>
      <div className='showcase-content flex-col'>
        <div className='showcase-title skeleton-item skeleton-item-75 skeleton-item-medium'></div>
        {desc && <div className='showcase-desc skeleton-item skeleton-item-75 skeleton-item-xxl'></div>}
        <div className='showcase-btn skeleton-item skeleton-item-xxl '></div>
      </div>
      <div className='showcase-image skeleton-item skeleton-item-fit skeleton-item-min-h-150 skeleton-image'></div>
    </div>
  );
}
