import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client.js';

// the cache: path --> the last data we got for it, like '/api/lists' --> [ ...my lists ]
// it's outside the hook, so it's still there when a page closes and opens again (Session 22)
const cache = new Map();

// logout calls this, so the next person who logs in never sees my lists
export function clearApiCache() {
  cache.clear();
}

// custom hook: loads `path` from our API and keeps data / error / loading in state
export function useApi(path) {
  // already in the cache? start with it --> the page shows right away, no skeleton
  const [data, setState] = useState(() => cache.get(path) ?? null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cache.has(path));

  // useCallback keeps the same load function between renders (unless path changes),
  // otherwise the effect would run again and again --> endless requests
  const load = useCallback(() => {
    const before = cache.get(path); // what the cache has for this path right now (maybe nothing)
    setState(before ?? null); // a new path: show what the cache has for it, or nothing
    setLoading(!cache.has(path)); // "loading" only if there's nothing to show yet
    setError(null);
    apiFetch(path)
      .then(fresh => {
        // i changed something on screen while waiting (like a status)? then this answer is older --> skip it
        if (cache.get(path) !== before) return;
        cache.set(path, fresh); // every good answer goes in the cache
        setState(fresh);
      }, setError)
      .finally(() => setLoading(false));
  }, [path]);

  // the linter doesn't like setState inside an effect, but load() just starts the fetch (session 20 pattern)
  // it still fetches even when the cache had the data: every cache goes stale, so i refresh it in the background
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // setData updates the screen AND the cache, so my changes are still there when i come back
  // like a normal setX, it takes a new value or a function (prev => new value)
  const setData = useCallback(update => {
    const next = typeof update === 'function' ? update(cache.get(path)) : update;
    cache.set(path, next);
    setState(next);
  }, [path]);

  // setData too, so a page can change one item on screen without loading everything again
  return { data, setData, error, loading, reload: load };
}
