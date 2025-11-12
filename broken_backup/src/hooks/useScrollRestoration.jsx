import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType, useNavigation } from 'react-router';

/**
 * Restores window scroll position on back/forward navigation
 * after data has loaded, avoiding layout shifts.
 */
export default function useWindowScrollRestoration(historyBehavior = 'auto', newNavigationBehavior = 'instant') {
  const positions = useRef(new Map());
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigation = useNavigation();
  const key = location.key;

  // Captured while navigation is in-flight (loading/submitting)
  const preventScrollResetRef = useRef(null);

  useEffect(() => {
    // Disable browser scroll restoration
    history.scrollRestoration = 'manual';
  }, []);

  // Capture preventScrollReset while navigation is in-flight (navigation.location exists here)
  useLayoutEffect(() => {
    if (location.state?.preventScrollReset) {
      preventScrollResetRef.current = location.state.preventScrollReset;
    } else {
      preventScrollResetRef.current = false;
    }
  }, [location.state]);

  // Save scroll position before leaving the page
  useLayoutEffect(() => {
    return () => {
      if (navigation.state == 'loading') return;
      const y = window.scrollY;
      positions.current.set(key, y);
    };
  }, [key, navigation.state]);

  // Restore scroll *after* data is done loading
  useEffect(() => {
    if (navigation.state !== 'idle') return;
    if (navigationType === 'POP') {
      // Back/forward navigation
      const y = positions.current.get(key) || 0;
      window.scrollTo({
        top: y,
        left: 0,
        behavior: historyBehavior,
      });
    } else {
      if (preventScrollResetRef.current) return;
      // New navigation
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: newNavigationBehavior,
      });
      // account for mobile loading time
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: newNavigationBehavior,
        });
      }, 200);
    }
  }, [key, navigationType, navigation.state, historyBehavior, newNavigationBehavior]);
}
