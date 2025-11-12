import { useEffect, useRef } from 'react';
import useAddress from '../hooks/useAddress';
import useUpdateAddress from '../hooks/useUpdateAddress';
import useUser from '../hooks/useUser';
import '../styles/form.css';
import Form from './Form';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

export default function EditAddressForm({ onSuccess }) {
  const isGuest = useUser((s) => s.isGuest);
  const { updateAddress, isPending, isError, isSuccess } = useUpdateAddress({ onSuccess });
  const toastId = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();
    const address = Object.fromEntries(new FormData(e.target));
    updateAddress(address).then((res) => {
      if (!isGuest) return res;
      if (res.statusText === 'OK') toast.success('Updated successfully.');
    });
  };

  const { address } = useAddress();
  const firstName = useUser((s) => s.user && s.user.firstName);
  const lastName = useUser((s) => s.user && s.user.lastName);
  const phone = useUser((s) => s.user?.phone);

  const inputs = [
    { name: 'addressName', type: 'text', placeholder: 'Address Name', defaultValue: address?.addressName, required: true, active: !isGuest },
    { name: 'firstName', type: 'text', placeholder: 'First Name', defaultValue: address?.firstName || firstName, size: 'md', required: true },
    { name: 'LastName', type: 'text', placeholder: 'Last Name', defaultValue: address?.lastName || lastName, size: 'md', required: true },
    { name: 'country', type: 'select', options: [{ name: 'Turkey' }, { name: 'United States' }], placeholder: 'Country', defaultValue: address?.country, size: 'md', required: true },
    { name: 'city', type: 'text', placeholder: 'City', defaultValue: address?.city, size: 'md', required: true },
    { name: 'state', type: 'text', placeholder: 'State', defaultValue: address?.state, size: 'md', required: true },
    { name: 'postalCode', type: 'text', placeholder: 'Zip Code', defaultValue: address?.postalCode, size: 'md', required: true },
    { name: 'address', type: 'text', placeholder: 'Address', defaultValue: address?.address, required: true },
    { name: 'phone', type: 'phone', placeholder: 'Phone', defaultValue: address?.phone || phone, required: true },
    { name: 'email', type: 'email', placeholder: 'E-mail', defaultValue: address?.email, required: true, active: isGuest },
  ];

  useEffect(() => {
    if (isPending) toastId.current = toast.loading('Updating...');
    if (!isPending && isError) toast.error('Something went wrong.', { id: toastId.current });
    if (!isPending && isSuccess) toast.success('Updated successfully.', { id: toastId.current });
  }, [isPending, isError, isSuccess]);
  return (
    <>
      <Form noBtn={isGuest} disableBtn={isPending} submitText='Save' onSubmit={handleSubmit} inputs={inputs} action={isGuest ? '/guest-address' : '/address'} />
      <div className='flex justify-between'>{isPending && <Spinner />}</div>
    </>
  );
}
