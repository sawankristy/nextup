import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { searchTitles } from '../api/search.js';
import { useApi } from '../hooks/useApi.js';
import AppLayout from '../components/AppLayout.jsx';
import BackLink from '../components/BackLink.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SearchResult from '../components/SearchResult.jsx';

export default function SearchPage() {
  const { id } = useParams();
  const { data: list, error: listError } = useApi(`/api/lists/${id}`);
  const { data: items, setData: setItems, error: itemsError } = useApi(`/api/lists/${id}/items`);
  const [query, setQuery] = useState(''); // the last thing searched
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle / loading / error / ready
  const [addError, setAddError] = useState('');

  const category = list?.category;

  // runs every time a new search is sent (and once we know the list's category)
  useEffect(() => {
    if (!query || !category) return;
    let ignore = false; // if a newer search starts, the old answer is ignored

    // useEffect can't be async itself, so i make an async function inside and call it
    async function load() {
      setStatus('loading');
      try {
        const found = await searchTitles(category, query);
        if (!ignore) {
          setResults(found);
          setStatus('ready');
        }
      } catch {
        if (!ignore) setStatus('error');
      }
    }
    load();

    return () => { ignore = true; }; // cleanup
  }, [query, category]);

  async function addTitle(result) {
    setAddError('');
    try {
      const item = await apiFetch(`/api/lists/${id}/items`, {
        method: 'POST',
        body: JSON.stringify(result),
      });
      setItems(prev => [item, ...prev]); // now this result shows "✓ Added"
    } catch (err) {
      setAddError(err.message);
    }
  }

  const error = listError || itemsError;
  if (error) {
    return (
      <AppLayout>
        <BackLink to="/lists">My Lists</BackLink>
        <p className="error" role="alert">{error.message}</p>
      </AppLayout>
    );
  }
  if (!list || !items) {
    return <AppLayout><p className="muted">Loading…</p></AppLayout>;
  }

  const isBooks = list.category === 'book';
  const addedIds = items.map(item => item.externalId);

  return (
    <AppLayout>
      <BackLink to={`/lists/${id}`}>{list.name}</BackLink>
      <div className="list-head">
        <CategoryBadge category={list.category} />
        <h1>Add a {list.category}</h1>
      </div>

      <SearchBar
        label={isBooks ? 'Search books' : 'Search movies'}
        placeholder={isBooks ? 'Title or author' : 'Movie title'}
        onSearch={setQuery}
        disabled={status === 'loading'}
      />
      <p className="muted small source">Results from {isBooks ? 'Open Library' : 'TMDB'}</p>

      {status === 'loading' && <p className="muted">Searching…</p>}
      {status === 'error' && (
        <p className="error" role="alert">Couldn't search right now. Try again in a minute.</p>
      )}
      {status === 'ready' && results.length === 0 && (
        <p className="empty">No results for “{query}”. Try another spelling.</p>
      )}
      {addError && <p className="error" role="alert">{addError}</p>}

      {status === 'ready' && results.length > 0 && (
        <ul className="result-list">
          {results.map(result => (
            <SearchResult
              key={result.externalId}
              result={result}
              added={addedIds.includes(result.externalId)}
              onAdd={addTitle}
            />
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
