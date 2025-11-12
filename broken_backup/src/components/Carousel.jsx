import '../styles/carousel.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import useEventListener from '../hooks/UseEventListener';
import FlatBtn from './FlatBtn';
import useThrottle from '../hooks/useThrottle';
import TimerBar from './TimerBar';
import useDebouncedCallback from '../hooks/useDebouncedCallback';

function Carousel({ children, className, isSlider = false, ...rest }) {
  const [scrollable, setScrollable] = useState(false);
  const [count, setCount] = useState(0);
  const carouselRef = useRef();
  const bodyRef = useRef();
  const carouselItems = useRef();
  const prevIndex = useRef(0);

  useEventListener('resize', () => {
    setScrollable(bodyRef.current.scrollWidth > carouselRef.current.clientWidth);
  });

  useEffect(() => {
    setScrollable(bodyRef.current.scrollWidth > carouselRef.current.clientWidth);

    carouselItems.current = bodyRef.current.querySelectorAll('.carousel-item');
    setCount(carouselItems.current.length);
  }, [setScrollable]);

  const handleClick = useCallback((e, dir) => {
    e?.stopPropagation();
    const { scrollLeft, offsetWidth } = bodyRef.current;
    const itemWidth = carouselItems.current[0]?.offsetWidth || 0;
    const skip = Math.max(Math.floor(offsetWidth / itemWidth), 1);
    const maxIndex = carouselItems.current.length - skip;
    const currentIndex = Math.round(scrollLeft / itemWidth);
    let scrollToIndex = currentIndex + skip * dir;

    if (prevIndex.current >= maxIndex && dir === 1) scrollToIndex = 0;
    if (prevIndex.current <= 0 && dir === -1) scrollToIndex = maxIndex;

    const scrollTo = carouselItems.current[scrollToIndex]?.offsetLeft;

    prevIndex.current = scrollToIndex;
    bodyRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
  }, []);

  return (
    <div className='flex carousel-wrapper'>
      <div className='carousel-container'>
        <div ref={carouselRef} className='carousel'>
          <div ref={bodyRef} className={className ? 'carousel-body ' + className : 'carousel-body'} {...rest}>
            {children}
          </div>
          {scrollable && (
            <>
              <FlatBtn className='carousel-btn prev' icon='/icons/arrow-left.svg' onClick={(e) => handleClick(e, -1)} />
              <FlatBtn className='carousel-btn next' icon='/icons/arrow-right.svg' onClick={(e) => handleClick(e, 1)} />
            </>
          )}
          {isSlider && <ScrollIndicator parentRef={bodyRef} count={count} />}
          {isSlider && <CustomTimerBar parentRef={bodyRef} onTimeout={() => handleClick(null, 1)} />}
        </div>
      </div>
    </div>
  );
}

function Item({ children, className, ...rest }) {
  return (
    <div className={className ? 'carousel-item ' + className : 'carousel-item'} {...rest}>
      {children}
    </div>
  );
}

function ScrollIndicator({ parentRef, count }) {
  const [current, setCurrent] = useState(0);

  const handleScroll = useThrottle((e) => {
    const { scrollLeft, clientWidth } = e.target;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== current) setCurrent(index);
  });

  useEventListener('scroll', handleScroll, parentRef?.current);

  return (
    <div className='scroll-indicator'>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={'scroll-indicator-item' + (i === current ? ' active' : '')}></div>
        ))}
    </div>
  );
}

function CustomTimerBar({ parentRef, onTimeout }) {
  const [active, setActive] = useState(true);
  const waitingRef = useRef(false);

  const handleScroll = useDebouncedCallback(
    () => {
      if (!active) setActive(true);
    },
    [setActive],
    200
  );

  useEffect(() => {
    if (active) waitingRef.current = false;
  }, [active]);

  useEventListener(
    'scroll',
    () => {
      if (!waitingRef.current) setActive(false);
      waitingRef.current = true;
      handleScroll();
    },
    parentRef?.current
  );

  return <TimerBar onTimeout={onTimeout} duration='10s' repeat='1' active={active} />;
}

Carousel.Item = Item;

export default Carousel;

export function CarouselSkeleton({ children, repeat = 3 }) {
  return (
    <div className='flex'>
      <div className='carousel-container skeleton'>
        <div className='carousel skeleton flex'>
          <div className='carousel-body skeleton'>
            {[...Array(repeat)].map((_, i) => (
              <div key={i} className='carousel-item'>
                {children}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
