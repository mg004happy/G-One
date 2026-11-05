import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 5000;

/** Refresh visible data while a screen is open, and catch up when the tab regains focus. */
export const usePolling = (refresh, intervalMs = DEFAULT_INTERVAL_MS) => {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    let lastRefresh = 0;
    let inFlight = false;
    const runRefresh = () => {
      if (document.visibilityState !== 'visible' || inFlight) return;
      const now = Date.now();
      if (now - lastRefresh < 1000) return;
      lastRefresh = now;
      inFlight = true;
      Promise.resolve()
        .then(() => refreshRef.current())
        .catch(() => {})
        .finally(() => { inFlight = false; });
    };

    const timer = window.setInterval(runRefresh, intervalMs);
    document.addEventListener('visibilitychange', runRefresh);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', runRefresh);
    };
  }, [intervalMs]);
};
