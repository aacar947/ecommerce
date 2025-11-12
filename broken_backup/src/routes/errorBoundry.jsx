import { useRouteError } from 'react-router';
import Icon from '../components/Icon';
export default function ErrorBoundry() {
  const error = useRouteError();

  console.error('An error occured while loading the page.\n', error);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Icon className='maxed-size' icon='/icons/error.svg' size='256px' />
      <h1 style={{ marginTop: '20px', fontSize: '48px' }}>Something went wrong</h1>
      <p>Sorry, some error occured while loading the page.</p>
      <p>
        You can go back to the <a href='/'>home page</a>.
      </p>
      {process.env.NODE_ENV === 'development' && <p className='bold'>{error.message}</p>}
    </div>
  );
}
