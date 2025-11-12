import { useContextSelector } from 'use-context-selector';
import { AuthContext } from '../contexts/AuthProvider';

export default function useAuth(selector = (state) => state) {
  return useContextSelector(AuthContext, selector);
}
