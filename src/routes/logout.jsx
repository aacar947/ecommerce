import { useNavigate } from 'react-router';
import api from '../utils/api';
import useAuth from '../hooks/UseAuth';
import { useLayoutEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function Logout() {
  const setToken = useAuth((s) => s.setToken);
  const navigate = useNavigate();

  const logout = async () => {
    return await api.logout();
  };

  const { mutate } = useMutation({
    mutationKey: ['logout'],
    mutationFn: logout,

    retryDelay: (attempt) => (attempt < 7 ? 2 ** (attempt - 1) * 1000 : 60 * 1000),
    onSuccess: () => {
      navigate('/', { replace: true });
      setToken(null);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useLayoutEffect(() => {
    mutate();
  }, []);

  return null;
}
