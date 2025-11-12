import Icon from './Icon';

export default function NoResults({ size = 256, ...rest }) {
  const fontSize = Math.max(Math.round(size / 8), 24);
  return (
    <div {...rest} style={{ color: 'var(--light-gray-600)' }}>
      <Icon className='maxed-size justify-self-center' icon='/icons/no-results.svg' size={size + 'px'} />
      <h1 style={{ textAlign: 'center', fontSize: `${fontSize}px` }}>We couldn't find anything.</h1>
      <p style={{ textAlign: 'center' }}>Oops, looks like there's nothing here.</p>
    </div>
  );
}
