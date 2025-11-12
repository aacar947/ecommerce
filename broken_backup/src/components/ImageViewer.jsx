import { useState } from 'react';

export default function ImageViewer({ images, alt, className, ...rest }) {
  const [index, setIndex] = useState(0);

  const handleSelection = (e, i) => {
    e.stopPropagation();
    setIndex(i);
  };
  return (
    <div className={'image-viewer' + (className ? ' ' + className : '')} {...rest}>
      <div className='image'>
        <img loading='lazy' aria-label={alt} src={images[index]} alt={alt} />
      </div>
      <div className='image-viewer-nav'>
        <div className='image-viewer-nav-body'>
          {images.map((image, i) => (
            <div key={i} className={'image-viewer-nav-item' + (i === index ? ' active' : '')} onMouseEnter={(e) => handleSelection(e, i)} onClick={(e) => e.stopPropagation()} onTouchStart={(e) => handleSelection(e, i)}>
              <div>
                <img src={image || images[0]} alt={alt} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImageViewerSkeleton() {
  return (
    <div className='skeleton-item-bg image-viewer flex-col justify-self-center'>
      <div className='image skeleton-item skeleton-item-fit skeleton-image-4-3'></div>
      <div className='image-viewer-nav skeleton-body'></div>
    </div>
  );
}
