import { NavigationStateContext } from '../contexts/NavigationStateProvider';
import { useContextSelector } from 'use-context-selector';

export default function useNavigationState(selector = (s) => s) {
  return useContextSelector(NavigationStateContext, selector);
}
