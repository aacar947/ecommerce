import { createContext, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router';

export const BreadCrumbsContext = createContext();

export default function BreadCrumbsProvider({ children }) {
  const [crumbs, setCrumbs] = useState([]);
  const [title, setTitle] = useState();
  const lastLocation = useRef();
  const location = useLocation();

  useEffect(() => {
    if (!Array.isArray(crumbs)) throw new Error('crumbs must be an array');
    const title = crumbs[crumbs.length - 1]?.title;
    if (!title) {
      if (crumbs.length > 0) setCrumbs([]);
      setTitle(null);
      return;
    }

    if (crumbs.length > 0) {
      setTitle(
        crumbs[crumbs.length - 1].title
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      );
    }
  }, [crumbs, setTitle, setCrumbs]);

  useLayoutEffect(() => {
    if (location.pathname !== lastLocation.current) setCrumbs([]);
    lastLocation.current = location.pathname;
  }, [location.pathname]);

  return (
    <BreadCrumbsContext.Provider value={{ crumbs, setCrumbs, lastLocationRef: lastLocation }}>
      {crumbs.length > 0 && title && <title>{title}</title>}
      {children}
    </BreadCrumbsContext.Provider>
  );
}
