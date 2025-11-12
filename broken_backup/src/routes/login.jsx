/* eslint-disable react-refresh/only-export-components */
import { Link, useActionData, useNavigate, useLocation } from 'react-router';
import FormSection from '../components/FormSection';
import api from '../utils/api';
import { useEffect, useRef } from 'react';
import useUser from '../hooks/useUser';
import useAuth from '../hooks/UseAuth';

export default function Login() {
  const requirements = [
    { placeholder: 'Email or Username', name: 'email', type: 'text', required: true, pattern: '^(?:[A-Za-z][A-Za-z0-9_]{2,15}|[^\\s@]+@[^\\s@]+\\.[^\\s@]+)$' },
    { placeholder: 'Password', name: 'password', type: 'password', required: true },
  ];
  const userId = useUser((s) => s.user?.id);
  const setToken = useAuth((s) => s.setToken);
  const actionData = useActionData();
  const location = useLocation();
  const from = useRef(location.state?.from || '/');

  useEffect(() => {
    if (actionData && actionData.data && actionData.data.accessToken) setToken(actionData.data.accessToken);
  }, [actionData]);

  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      navigate(from.current, { replace: true });
    }
  }, [navigate, userId]);

  const footer = (
    <>
      <label htmlFor='register'>Don't have an account? </label>
      <Link className='link' name='register' to='/register'>
        Register now.
      </Link>
    </>
  );

  return (
    <FormSection footer={footer} action='/login' method='post' name='Login' submitText='Login' submitBtnClass='confirm' requirements={requirements}>
      {actionData && actionData.error && actionData.response?.status === 400 && <div className='error'>Your username/e-mail or password is incorrect</div>}
      {actionData && actionData.error && actionData.response?.status !== 400 && <div className='error'>Something went wrong!</div>}
    </FormSection>
  );
}
export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const res = await api.login({ email, password });
  let data = null;
  let error = false;

  if (res?.status === 200) {
    data = res.data;
  } else {
    error = true;
  }

  return { data, error, response: res };
}

export async function loader() {
  return null;
}
