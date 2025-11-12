import { useEffect, useRef } from 'react';
import useObserver from '../hooks/useObserver';
import '../styles/timer-bar.css';

export default function TimerBar({ duration = '10s', onTimeout, pauseMargin = '200px', repeat = 'infinite', active = true }) {
  const timerRef = useRef(null);
  const [ref, entry] = useObserver({
    enabled: active, // only observe if active
    rootMargin: pauseMargin,
  });

  useEffect(() => {
    const el = timerRef?.current;
    if (!el) return;
    // Pause or resume animation depending on visibility
    if (entry?.isIntersecting) {
      el.style.animationPlayState = 'running';
    } else {
      el.style.animationPlayState = 'paused';
    }
  }, [entry, timerRef]);

  return (
    <div ref={ref} className='timer-bar'>
      {active && (
        <div
          ref={timerRef}
          className='timer-bar-progress'
          onAnimationIteration={onTimeout}
          onAnimationEnd={onTimeout}
          style={{
            animationDuration: duration,
            animationIterationCount: repeat,
          }}
        />
      )}
    </div>
  );
}
