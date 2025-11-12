import '../styles/skeleton.css';
import '../styles/infinite-scroller.css';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { createContext, useContext, useContextSelector } from 'use-context-selector';
import useObserver from '../hooks/useObserver';
import useEventListener from '../hooks/UseEventListener';
import useDebouncedCallback from '../hooks/useDebouncedCallback';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import SortBySelector from './SortBySelector';
import NoResults from './NoResults';
import FlatBtn from './FlatBtn';
import Overlay from './Overlay';
import Input from './Input';
import Btn from './Btn';
import Toggle from './Toggle';
import useFilterValidation from '../hooks/useFilterValidation';

const FiltersContext = createContext();
export default function InfiniteProductsScroller({ title, products, isFetching, isLoading, hasMore, fetchMore, total, fetchLimit, tags }) {
  const [observerRef] = useObserver({
    onIntersect: fetchMore,
    enabled: hasMore && !isFetching,
    threshold: 1,
    rootMargin: '400px',
  });

  const filters = useMemo(() => {
    const priceRange = {
      title: 'Price Range',
      className: 'price-range',
      options: [
        { title: 'Lowest', name: 'minPrice', type: 'number' },
        { title: 'Highest', name: 'maxPrice', type: 'number' },
      ],
    };
    const categories = { title: 'Category', name: 'category', options: tags?.categories };
    const brands = { title: 'Brand', name: 'brand', options: tags?.brands };
    const shipsWw = { title: 'Ships Worldwide', value: 'true', name: 'shipsWorldwide' };
    return [priceRange, categories, brands, shipsWw];
  }, [tags]);

  return (
    <FilterProvider filters={filters}>
      <div className='scroller-wrapper'>
        {!isLoading && <ScrollerHeader title={title} total={total} isFetching={isFetching} />}
        {isLoading && <ScrollerHeaderSkeleton />}
        <InfiniteScroller products={products} isFetching={isFetching} fetchLimit={fetchLimit} total={total} />
        <ScrollerFooter total={total} productCount={products?.length} />
        <div className='intersection-observer' ref={observerRef}></div>
      </div>
    </FilterProvider>
  );
}

function FilterProvider({ children, filters }) {
  const buffer = useRef(new Set());
  const [bufferSize, setBufferSize] = useState(0);
  return <FiltersContext.Provider value={{ filters, bufferRef: buffer, bufferSize, setBufferSize }}>{children}</FiltersContext.Provider>;
}

function ScrollerHeader({ title, total }) {
  return (
    <>
      <div className='scroller-header'>
        <div className='scroller-title'>
          {typeof title === 'string' && title && <h2 className='title'>{title}</h2>}
          {React.isValidElement(title) && title}
          <span className='total-count'>
            {total || 0}
            {total === 1 ? ' Item' : ' Items'}
          </span>
        </div>
      </div>
      {total === 0 ? null : (
        <FiltersContainer>
          <SortBySelector />
        </FiltersContainer>
      )}
    </>
  );
}

function ScrollerHeaderSkeleton() {
  return (
    <div className=' scroller-header'>
      <div className='scroller-title skeleton'>
        <div className='title skeleton-item skeleton-item-medium skeleton-item-200px'></div>
        <div className='total-count skeleton-item skeleton-item-100px skeleton-item-margin'></div>
      </div>
    </div>
  );
}

function InfiniteScroller({ products, isFetching, fetchLimit, total }) {
  if (total === 0 || (!products && !isFetching)) return <NoResults className='no-results' />;

  const limit = total ? Math.min(fetchLimit, total) : fetchLimit;

  const skeleton = useMemo(() => {
    return [...Array(limit || 0)].map((_, i) => <ProductCardSkeleton key={i} />);
  }, [limit]);

  return (
    <div className='infinite-scroller'>
      {products?.map((product) => (
        <MemoizedProductCard key={product.id} product={product} />
      ))}
      {isFetching && skeleton}
    </div>
  );
}

function FiltersContainer({ children }) {
  const [active, setActive] = useState(false);
  const ref = useRef();

  const handlefocus = useCallback(
    (e) => {
      if (ref.current.contains(e.target)) return;
      setActive(false);
    },
    [setActive]
  );

  useEventListener('focusin', handlefocus, window, { enabled: active });

  return (
    <div ref={ref} className='scroller-filters' data-active={active}>
      <Overlay active={active} setActive={setActive} />
      {children}
      <Filters active={active} setActive={setActive} />
    </div>
  );
}

function Filters({ active, setActive }) {
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const ref = useRef();

  const positionHandler = useCallback(() => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const viewportWidth = document.documentElement.scrollWidth;
    setPosition({
      top: Math.max(rect.top, 0),
      right: Math.max(viewportWidth - rect.right, 0),
    });
  }, [active]);

  useEffect(() => {
    positionHandler();
  }, [active, positionHandler]);

  useEventListener('resize', () => {
    positionHandler();
  });

  useEventListener('scroll', () => {
    positionHandler();
  });

  useEventListener('transitionend', (e) => {
    if (e.target.classList.contains('scroller-filters')) positionHandler();
  });

  return (
    <div ref={ref} className='filter-container'>
      <FilterMenu active={active} position={position} />
      <FilterBtn onClick={() => setActive(!active)} active={active} />
    </div>
  );
}

function FilterMenu({ active, position }) {
  const filters = useContextSelector(FiltersContext, (s) => s.filters);
  const [params, setParams] = useSearchParams();
  const buffer = useContextSelector(FiltersContext, (s) => s.bufferRef);
  const bufferSize = useContextSelector(FiltersContext, (s) => s.bufferSize);
  const setBufferSize = useContextSelector(FiltersContext, (s) => s.setBufferSize);

  const isValidOption = (input) => {
    switch (input.type) {
      case 'checkbox':
      case 'radio':
        return input.checked;
      case 'text':
        return input.value !== '' && input.checkValidity();
      case 'number':
        return input.value !== '' && !isNaN(input.value) && input.value > 0 && input.checkValidity();
      default:
        return false;
    }
  };

  const flushBuffer = () => {
    const newParams = new URLSearchParams(params.toString());

    buffer.current.forEach((target = document.documentElement) => {
      const name = target.name;
      const value = target.value;
      if (isValidOption(target) && target.type === 'checkbox') {
        const hasValue = newParams.has(name, value);
        if (!hasValue) newParams.append(name, value);
      } else newParams.delete(name, value);

      if (isValidOption(target) && target.type !== 'checkbox') {
        newParams.set(name, value);
      } else if (target.type !== 'checkbox') newParams.delete(name);
    });

    buffer.current.clear();
    setBufferSize(0);
    setParams(newParams, { replace: true });
  };

  return (
    <div className='filter-menu' data-active={active} style={{ top: `${position.top}px`, right: `${position.right}px`, '--filter-menu-right': `${position.right}px` }}>
      <div className='filter-menu-inner'>
        <SortBySelector />
        <h3>Filters</h3>
        <ul className='filter-list'>{filters && filters.map((filter) => <FilterOptions key={'filter-' + filter.name} filter={filter} />)}</ul>
        <Btn onClick={flushBuffer} disabled={bufferSize === 0} className='apply-btn confirm'>
          Apply
        </Btn>
      </div>
    </div>
  );
}

function FilterOptions({ filter }) {
  const { bufferRef: buffer } = useContext(FiltersContext);
  const setBufferSize = useContextSelector(FiltersContext, (s) => s.setBufferSize);

  const { isValidChange } = useFilterValidation();

  const handleChange = useCallback(
    (e) => {
      if (!isValidChange(e.target)) {
        buffer.current.delete(e.target);
        setBufferSize(buffer.current.size);
        return;
      }

      buffer.current.add(e.target);
      setBufferSize(buffer.current.size);
    },
    [setBufferSize, isValidChange]
  );

  const debouncedHandleChange = useDebouncedCallback((e) => handleChange(e), [handleChange], 100);

  if (filter.value) {
    return <ToggleFilter onChange={handleChange} name={filter.name} option={filter} type='toggle' />;
  }

  if (!filter.options || filter.options.length === 0) return null;

  return (
    <li>
      <fieldset className={filter.className}>
        <legend>{filter.title}</legend>
        <ul className='filter-list'>
          {filter.options.map((option) => {
            if (option.type !== undefined && option.type !== 'toggle') return <TextFilter key={'filter-' + option.name} {...option} onChange={debouncedHandleChange} />;
            const name = typeof option === 'string' ? option : option.name;
            return <ToggleFilter key={'filter-' + name} option={option} type='chip' name={filter.name} onChange={handleChange} />;
          })}
        </ul>
      </fieldset>
    </li>
  );
}

function TextFilter({ type, name, title, ...rest }) {
  const [params] = useSearchParams();
  const value = params.get(name) || '';
  return (
    <li className='filter-item'>
      <Input type={type || 'text'} placeholder={title} defaultValue={value} name={name} {...rest} />
    </li>
  );
}

function ToggleFilter({ option, type, name, ...rest }) {
  const [params] = useSearchParams();
  let title, value;
  if (typeof option === 'string') {
    title = option;
    value = option.toLowerCase().replace(/\s/g, '_');
  } else {
    title = option.title;
    value = option.value;
  }
  const hasValue = params.has(name, value);

  return (
    <li className='filter-item' {...rest}>
      <Toggle name={name} title={title} type={type} value={value} defaultChecked={hasValue} />
    </li>
  );
}

function FilterBtn({ active, ...props }) {
  return (
    <FlatBtn {...props} className='filter-btn menu-btn hover-effect' iconSize='20px' data-active={active}>
      <div className='menu-btn-icon css-icon'>
        <div className='menu-bar bar-1'>
          <div className='circle' />
        </div>
        <div className='menu-bar bar-2'>
          <div className='circle' />
        </div>
        <div className='menu-bar bar-3'>
          <div className='circle' />
        </div>
      </div>
    </FlatBtn>
  );
}

function ScrollerFooter({ total, productCount }) {
  return (
    <div className='scroller-footer'>
      {total > 0 && (
        <>
          <hr />
          <strong>
            {productCount}/{total}
          </strong>
        </>
      )}
    </div>
  );
}

const MemoizedProductCard = memo(ProductCard, (prev, next) => prev.product.id === next.product.id);
