import { useLayoutEffect, useState } from 'react';
import api, { instance } from '../utils/api';
import { createContext } from 'use-context-selector';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  //access token
  const [token, setToken] = useState();

  useLayoutEffect(() => {
    const interceptor = instance.interceptors.request.use((config) => {
      if (!token || config._retry || config._skipAuth) return config;
      // Add the access token to the request headers
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return () => instance.interceptors.request.eject(interceptor);
  }, [token]);

  useLayoutEffect(() => {
    const interceptor = instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        console.warn('Access token expired. Retrying to get authorization token.');
        const expectedMessages = ['Access Token is required', 'Token Expired!'];

        // At this point you should check response status code and return appropriate error
        // or retry the request
        if (!expectedMessages.includes(err.response?.data?.message)) {
          console.error('Unexpected error', err.message, err.response?.data?.message);
          return Promise.reject(err);
        }

        const retryConfig = err.config;
        // skip refresh token if request is marked as _skipAuth
        // this is useful for requests that do not require access token authentication
        // i.e. refreshtoken request
        // this also prevents infinite loop for refreshToken request
        if (retryConfig._skipAuth) return Promise.reject(err);

        try {
          // refresh access token if original request resulted in 401
          const res = await api.refreshToken();
          if (res && res.status === 200) setToken(res.data.accessToken);
          // retry the original request
          retryConfig.headers.Authorization = `Bearer ${res.data.accessToken}`;
          retryConfig._retry = true;
          return instance(retryConfig);
        } catch (error) {
          console.error('Error refreshing access token:\n', error.message);
          setToken(null);
          return Promise.reject(error);
        }
      }
    );

    return () => instance.interceptors.response.eject(interceptor);
  }, [setToken]);

  const isPending = token === undefined;

  return <AuthContext.Provider value={{ token, setToken, isPending }}>{children}</AuthContext.Provider>;
}
export { AuthContext };
