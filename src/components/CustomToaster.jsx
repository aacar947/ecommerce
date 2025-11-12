import { Toaster, ToastBar } from 'react-hot-toast';
import '../styles/toaster.css';

export default function CustomToaster() {
  const toastOptions = {
    className: 'toast',
    duration: 5000,
    success: {
      className: 'toast toast-success',
    },
    error: {
      className: 'toast toast-error',
    },
    loading: {
      className: 'toast toast-loading',
      duration: Infinity,
    },
  };

  return (
    <Toaster position='top-right' containerClassName='toaster' toastOptions={toastOptions}>
      {(t) => (
        <div className={'toast-wrapper' + (t.visible ? ' enter' : ' exit')}>
          <ToastBar toast={t} style={{ animation: 'none' }} />
        </div>
      )}
    </Toaster>
  );
}
