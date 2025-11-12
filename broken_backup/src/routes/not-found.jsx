import Icon from '../components/Icon';
export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Icon name='not-found' className='maxed-size' icon='/icons/oops.svg' size='256px' />
      <h1 style={{ marginTop: '20px', fontSize: '48px' }}>404</h1>
      <h1 style={{ fontSize: '48px' }}>Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        You can go back to the <a href='/'>home page</a> or use the navigation menu to find what you need.
      </p>
    </div>
  );
}
