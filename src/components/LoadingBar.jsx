import '../styles/loadingbar.css';
import useNavigationState from '../hooks/useNavigationState';

export default function LoadingBar() {
  const { state } = useNavigationState();

  const statusColors = {
    loading: 'var(--loading-color)',
    submitting: 'var(--submitting-color)',
    idle: 'var(--body-color)',
  };
  return <div className='loading-bar' hidden={state === 'idle'} style={{ backgroundColor: statusColors[state] }}></div>;
}
