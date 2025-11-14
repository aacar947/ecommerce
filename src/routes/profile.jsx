import '../styles/profile.css';
import { scan } from 'react-scan';
import Section, { Row, Col } from '../components/Grid';
import ProfilePic from '../components/ProfilePic';
import UpdateForm from '../components/UpdateForm';
import api from '../utils/api';
import useDebounce from '../hooks/useDebounce';
import { useMemo, useState } from 'react';
import useUser from '../hooks/useUser';

export default function Profile() {
  if (process.env.NODE_ENV === 'development') scan({ enabled: true });

  return (
    <Section>
      <Row>
        <UserInfoCol />
        <AddressInfoCol />
        <PasswordFormCol />
        <PaymentInfoCol />
      </Row>
    </Section>
  );
}

function UserInfoCol() {
  const { firstName, lastName, email, phone, birthDate } = useUser((s) => s.user);
  const userId = useUser((s) => s.user.id);
  const maxDate = new Date().toISOString().slice(0, 10);
  const minDate = '1900-01-01';
  const userBirthDate = new Date(birthDate).toISOString().slice(0, 10);

  const profileInputs = useMemo(
    () => [
      idInput(userId),
      { name: 'firstName', type: 'text', placeholder: 'Name', defaultValue: firstName, required: true, size: 'md' },
      { name: 'lastName', type: 'text', placeholder: 'Lastname', defaultValue: lastName, size: 'md' },
      { name: 'email', type: 'email', placeholder: 'Email', defaultValue: email },
      { name: 'phone', type: 'phone', placeholder: 'Phone', defaultValue: phone, size: 'max-md' },
      { name: 'birthDate', type: 'date', min: minDate, max: maxDate, placeholder: 'Birth Date', defaultValue: userBirthDate },
    ],
    [firstName, lastName, email, phone, userId, userBirthDate, minDate, maxDate]
  );

  return (
    <UpdateFormCol inputs={profileInputs} title='User Informaiton' action='/profile'>
      <ProfilePic className='profile-big-pic' />
    </UpdateFormCol>
  );
}

function AddressInfoCol() {
  const address = useUser((s) => s.user.address.address);
  const city = useUser((s) => s.user.address.city);
  const state = useUser((s) => s.user.address.state);
  const country = useUser((s) => s.user.address.country);
  const postalCode = useUser((s) => s.user.address.postalCode);
  const userId = useUser((s) => s.user.id);

  const inputs = useMemo(
    () => [
      idInput(userId),
      { name: 'address', type: 'text', placeholder: 'Address', defaultValue: address },
      { name: 'city', type: 'text', placeholder: 'City', defaultValue: city },
      { name: 'state', type: 'text', placeholder: 'State', defaultValue: state },
      { name: 'country', type: 'select', options: [{ name: 'Turkey' }, { name: 'United States' }], placeholder: 'Country', defaultValue: country },
      { name: 'postalCode', type: 'text', placeholder: 'Zip Code', defaultValue: postalCode, className: 'input-sm' },
    ],
    [address, city, state, country, postalCode, userId]
  );

  return <UpdateFormCol title='Address Information' inputs={inputs} />;
}

function PaymentInfoCol() {
  const user = useUser((s) => s.user);
  const inputs = useMemo(
    () => [
      idInput(user.id),
      { name: 'cardHolder', type: 'text', placeholder: 'Card Holder', defaultValue: user.bank.cardHolder },
      { name: 'cardNumber', type: 'card', placeholder: 'Card Number', defaultValue: user.bank.cardNumber, size: 'max-md', className: 'input-md', pattern: '\\d{4} \\d{4} \\d{4} \\d{4}' },
      { name: 'expirationDate', type: 'expr-date', placeholder: 'Valid Thru', defaultValue: user.bank.cardExpire, size: 'max-sm', className: 'input-sm', pattern: '\\d{2}/\\d{2}' },
    ],
    [user.id, user.bank.cardNumber, user.bank.cardExpire]
  );
  return <UpdateFormCol title='Payment Information' inputs={inputs} />;
}

function UpdateFormCol({ inputs, children, action, title }) {
  return (
    <Col className='profile-col'>
      <UpdateForm title={title} inputs={inputs} headerContent={children} submitText='Save' method='post' action={action} />
    </Col>
  );
}

function PasswordFormCol() {
  const userId = useUser((s) => s.user.id);
  const [password, setPassword] = useDebounce('');
  const [match, setMatch] = useState(false);
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handlePasswordConfirmation = (e) => {
    setMatch(e.target.value === password);
  };

  const passwordInputs = [
    idInput(userId),
    { name: 'currentPassword', type: 'password', defaultValue: '', placeholder: 'Current Password', required: true },
    {
      name: 'password',
      placeholder: 'New Password',
      type: 'password',
      defaultValue: '',
      required: true,
      pattern: '^(?=.*[0-9])(?=.*[\\`!@#$%^&*?£\\,\\.<>=+\'";:\\-_\\(\\)\\[\\]\\{\\}\\/~\\|\\\\])[a-zA-Z0-9\\`!@#$%^&*?£\\,\\.<>=+\'";:\\-_\\(\\)\\[\\]\\{\\}\\/~\\|\\\\]{8,}$',
      onChange: handlePasswordChange,
      invalidMsg: 'Your password needs to contain at least 8 characters, one number, one letter and one special character.',
    },
    {
      name: 'confirm-password',
      defaultValue: '',
      placeholder: 'Confirm Your Password',
      type: 'password',
      required: true,
      className: !match ? 'invalid' : undefined,
      invalidMsg: 'Passwords do not match',
      onChange: handlePasswordConfirmation,
    },
  ];

  return <UpdateFormCol title='Change Password' inputs={passwordInputs} submitText='Save' method='post' action='/profile' />;
}

function idInput(userId) {
  return { name: 'id', type: 'hidden', value: userId };
}

export async function action({ request: req }) {
  await new Promise((res) => setTimeout(res, 1000));
  const form = await req.formData();
  const userId = form.get('id');
  form.delete('id');
  const res = await api.updateUser(userId, Object.fromEntries(form));
  return res.status === 200 ? { data: res.data, error: false } : { error: true, data: null };
}

export const handle = {
  disableCategoryList: true,
};
