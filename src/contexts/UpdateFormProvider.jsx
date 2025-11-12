import { createContext } from 'use-context-selector';
import { useState, useRef, useCallback } from 'react';
import { useFetcher } from 'react-router';

export const UpdateFormContext = createContext();

export default function UpdateFormProvider({ children }) {
  const fetcher = useFetcher();
  const changedFieldsRef = useRef([]);
  const [hasChanges, setHasChanges] = useState(false);

  const updateChanges = useCallback(() => {
    if (Object.keys(changedFieldsRef.current).length > 0) setHasChanges(true);
    else setHasChanges(false);
  }, [setHasChanges]);

  return <UpdateFormContext.Provider value={{ fetcher, changedFieldsRef, hasChanges, setHasChanges, updateChanges }}>{children}</UpdateFormContext.Provider>;
}
