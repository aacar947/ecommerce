import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext } from 'use-context-selector';
import useAuth from '../hooks/UseAuth';

const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState();
  const token = useAuth((s) => s.token);
  const queryClient = useQueryClient();

  const { data: res } = useQuery({
    queryKey: ['user', { token }],
    queryFn: () => {
      return api.getUser();
    },
    cacheTime: 0, // Disable cache to always fetch the latest user data
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (token && res && res.status === 200) setUser(res.data);
    else setUser(undefined);
    // if token is null that means user is logged out or token is expired
    if (token === null) setUser(null);
  }, [res, token]);

  const refreshUser = useCallback(() => {
    queryClient.invalidateQueries(['user']);
  }, [queryClient]);

  const isPending = user === undefined;
  const isGuest = user === null;
  const isAdmin = user?.role === 'admin';

  return <UserContext.Provider value={{ user, setUser, refreshUser, isPending, isGuest, isAdmin }}>{children}</UserContext.Provider>;
}

export { UserContext };
