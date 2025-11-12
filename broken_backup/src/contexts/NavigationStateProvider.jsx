import { useState, useEffect } from 'react';
import { createContext } from 'use-context-selector';
import { useNavigation } from 'react-router';

const NavigationStateContext = createContext();
export default function NavigationStateProvider({ children }) {
  const [state, setNavigationState] = useState('idle');

  const { state: navState } = useNavigation();

  useEffect(() => {
    setNavigationState(navState);
  }, [navState]);

  return <NavigationStateContext.Provider value={{ state, setNavigationState }}>{children}</NavigationStateContext.Provider>;
}

export { NavigationStateContext };
