import useUser from './useUser';
import api from '../utils/api';
import { useEffect, useState } from 'react';

export default function useAddress() {
  const [address, setAddress] = useState({});
  const userAddress = useUser((s) => s.user?.address);
  const isGuest = useUser((s) => s.isGuest);

  useEffect(() => {
    if (isGuest) {
      api.getGuestAddress().then((res) => setAddress(res.address));
    } else {
      setAddress(userAddress);
    }
  }, [isGuest, setAddress, userAddress]);

  return { address, setAddress };
}
