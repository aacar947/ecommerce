import { createContext } from 'use-context-selector';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useActionData } from 'react-router';

export const UpdateFormContext = createContext();

export default function UpdateFormProvider({ children }) {
  const data = useActionData();
  const [actionData, setActionData] = useState(data);
  const changedFieldsRef = useRef([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setActionData(data);
  }, [data, setActionData]);

  const resetActionData = useCallback(() => {
    setActionData(null);
  }, [setActionData]);

  const updateChanges = useCallback(() => {
    if (Object.keys(changedFieldsRef.current).length > 0) setHasChanges(true);
    else setHasChanges(false);
  }, [setHasChanges]);

  return <UpdateFormContext.Provider value={{ actionData, resetActionData, changedFieldsRef, hasChanges, setHasChanges, updateChanges }}>{children}</UpdateFormContext.Provider>;
}
