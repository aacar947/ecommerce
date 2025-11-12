import { useState, useRef, useEffect, useCallback } from 'react';
import useEventListener from '../hooks/UseEventListener';
import Icon from './Icon';
export default function Collapsible({ children, arrowSize = 16, maxHeight, ...rest }) {
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [active, setActive] = useState(false);
  const pRef = useRef();

  const isTooBig = useCallback(() => {
    return Number(pRef.current.scrollHeight) > maxHeight;
  }, [maxHeight]);

  useEffect(() => {
    if (isTooBig()) setIsCollapsible(true);
  }, [isTooBig, maxHeight]);

  const windowSizeHandler = useCallback(() => {
    if (isTooBig()) setIsCollapsible(true);
    else setIsCollapsible(false);
    setActive(false);
  }, [isTooBig]);

  const height = active ? pRef.current.scrollHeight + arrowSize : maxHeight + arrowSize;

  const className = isCollapsible && active ? 'collapsible active' : 'collapsible';

  useEventListener('resize', windowSizeHandler);

  return (
    <div className={className} data-collapsible={isCollapsible} style={{ '--collapsible-max-height': `${height}px` }} onClick={() => isCollapsible && setActive(!active)}>
      <div ref={pRef} {...rest}>
        {children}
      </div>
      <div className='shade'></div>
      <Icon className='arrow' icon='/icons/arrow-down.svg' size={`${arrowSize}px`}></Icon>
    </div>
  );
}
