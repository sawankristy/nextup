import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client.js';

// custom hook: loads `path` from our API and keeps data / error / loading in state
export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // useCallback keeps the same load function between renders (unless path changes),
  // otherwise the effect would run again and again --> endless requests
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch(path)
      .then(setData, setError)
      .finally(() => setLoading(false));
  }, [path]);

  // the linter doesn't like setState inside an effect, but load() just starts the fetch (session 20 pattern)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // setData too, so a page can change one item on screen without loading everything again
  return { data, setData, error, loading, reload: load };
}
