import { createContext } from 'use-context-selector';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';
import useNavigationState from '../hooks/useNavigationState';

export const UpdateFormContext = createContext();

export default function UpdateFormProvider({ children }) {
  const fetcher = useFetcher();
  const [actionData, setActionData] = useState(fetcher?.data);
  const changedFieldsRef = useRef([]);
  const [hasChanges, setHasChanges] = useState(false);
  const setNavigationState = useNavigationState((s) => s?.setNavigationState);

  useEffect(() => {
    setNavigationState(fetcher?.state);
  }, [fetcher?.state, setNavigationState]);

  useEffect(() => {
    setActionData(fetcher?.data);
  }, [fetcher?.data, setActionData]);

  const resetActionData = useCallback(() => {
    setActionData(null);
  }, [setActionData]);

  const updateChanges = useCallback(() => {
    if (Object.keys(changedFieldsRef.current).length > 0) setHasChanges(true);
    else setHasChanges(false);
  }, [setHasChanges]);

  return <UpdateFormContext.Provider value={{ fetcher, actionData, resetActionData, changedFieldsRef, hasChanges, setHasChanges, updateChanges }}>{children}</UpdateFormContext.Provider>;
}
