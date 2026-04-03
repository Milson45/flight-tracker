/* ============================================================
   useInterval Hook — Dan Abramov's declarative interval pattern
   
   WHY custom hook: setInterval doesn't play well with React's
   closure model. A naive useEffect + setInterval captures stale
   state. This hook uses a ref to always call the latest callback,
   and cleanly handles interval changes and unmounting.
   
   Reference: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
   ============================================================ */

import { useEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback — this ref is always up to date
  // so when the interval fires, it calls the current function,
  // not the one captured at mount time.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return; // null delay = paused

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}
