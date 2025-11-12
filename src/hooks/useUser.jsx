import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../contexts/UserProvider';

export default function useUser(selector = (state) => state) {
  return useContextSelector(UserContext, selector);
}
