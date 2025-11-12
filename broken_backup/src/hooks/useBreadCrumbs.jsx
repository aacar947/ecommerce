import { useCallback, useContext } from 'react';
import { BreadCrumbsContext } from '../contexts/BreadCrumbsProvider';

export default function useBreadCrumbs() {
  const { crumbs, setCrumbs, lastLocationRef } = useContext(BreadCrumbsContext);

  const applyCrumbs = useCallback(
    (crumbs, location) => {
      if (location) lastLocationRef.current = location;
      setCrumbs(crumbs);
    },
    [setCrumbs]
  );

  return { crumbs, setCrumbs: applyCrumbs };
}
