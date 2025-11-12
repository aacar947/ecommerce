/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Link } from 'react-router';
import FormSection from '../components/FormSection';

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get('name');
  const lastname = formData.get('lastname');
  const email = formData.get('email');
  const password = formData.get('password');
  console.log({ name, lastname, email, password });
  return { name, lastname, email, password };
}
export default function Register() {
  const [password, setPassword] = React.useState('');
  const [match, setMatch] = React.useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmation = (e) => {
    setMatch(e.target.value === password);
  };

  const requirements = [
    { name: 'name', placeholder: 'Name', type: 'text', required: true, pattern: '^[A-Z][a-z]+( [A-Z][a-z]+)*$', invalidMsg: 'Please enter a valid name.' },
    { name: 'lastname', placeholder: 'Lastname', type: 'text', required: true, pattern: '^[A-Z][a-z]+( [A-Z][a-z]+)*$', invalidMsg: 'Please enter a valid lastname.' },
    { name: 'email', placeholder: 'Email', type: 'email', required: true, pattern: '[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,4}$', invalidMsg: 'Please enter a valid email.' },
    {
      name: 'password',
      placeholder: 'Password',
      type: 'password',
      required: true,
      pattern: '^(?=.*[0-9])(?=.*[\\`!@#$%^&*?£\\,\\.<>=+\'";:\\-_\\(\\)\\[\\]\\{\\}\\/~\\|\\\\])[a-zA-Z0-9\\`!@#$%^&*?£\\,\\.<>=+\'";:\\-_\\(\\)\\[\\]\\{\\}\\/~\\|\\\\]{8,}$',
      onChange: handlePasswordChange,
      invalidMsg: 'Your password needs to contain at least 8 characters, one number, one letter and one special character.',
    },
    { name: 'confirm-password', placeholder: 'Confirm Password', type: 'password', required: true, className: !match ? 'invalid' : undefined, invalidMsg: 'Passwords do not match', onChange: handlePasswordConfirmation },
  ];

  const footer = (
    <>
      <label htmlFor='register'>Allready have an account? </label>
      <Link className='link' name='register' to='/login'>
        Login now.
      </Link>
    </>
  );

  return <FormSection footer={footer} method='post' action='/register' name='Register' submitText='Register' submitBtnClass='confirm' requirements={requirements} />;
}
