import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { searchTitles } from '../api/search.js';
import { useApi } from '../hooks/useApi.js';
import AppLayout from '../components/AppLayout.jsx';
import BackLink from '../components/BackLink.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ResultFilters from '../components/ResultFilters.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SearchResult from '../components/SearchResult.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { YEAR_RANGES } from '../labels.js';

// is this result in the chosen year range? a title with no year only shows with "Any year"
function matchesYear(result, year) {
  if (year === 'any') return true;
  const range = YEAR_RANGES.find(r => r.value === year);
  return Boolean(result.year) && result.year >= range.from && result.year <= range.to;
}

export default function SearchPage() {
  const { id } = useParams();
  const { data: list, error: listError } = useApi(`/api/lists/${id}`);
  const { data: items, setData: setItems, error: itemsError } = useApi(`/api/lists/${id}/items`);
  const [query, setQuery] = useState(''); // the last thing searched
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle / loading / error / ready
  const [addError, setAddError] = useState('');
  // the 3 filters: here and not in ResultFilters, because the results are filtered here
  // a new search doesn't touch them, so they stay
  const [year, setYear] = useState('any');
  const [coverOnly, setCoverOnly] = useState(false);
  const [hideAdded, setHideAdded] = useState(false);

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

  function clearFilters() {
    setYear('any');
    setCoverOnly(false);
    setHideAdded(false);
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
    return <AppLayout><Skeleton title type="rows" count={3} /></AppLayout>;
  }

  const isBooks = list.category === 'book';
  const addedIds = items.map(item => item.externalId);
  // the filters never change `results`: the shown ones are computed again on every render (never stored)
  const shown = results.filter(result =>
    matchesYear(result, year) &&
    (!coverOnly || result.imageUrl) &&
    (!hideAdded || !addedIds.includes(result.externalId))
  );
  const hasResults = status === 'ready' && results.length > 0;

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
      {hasResults && (
        <ResultFilters
          year={year}
          setYear={setYear}
          coverOnly={coverOnly}
          setCoverOnly={setCoverOnly}
          hideAdded={hideAdded}
          setHideAdded={setHideAdded}
        />
      )}

      {status === 'loading' && <Skeleton type="rows" count={3} />}
      {status === 'error' && (
        <p className="error" role="alert">Couldn't search right now. Try again in a minute.</p>
      )}
      {status === 'ready' && results.length === 0 && (
        <p className="empty">No results for “{query}”. Try another spelling.</p>
      )}
      {addError && <p className="error" role="alert">{addError}</p>}

      {hasResults && shown.length > 0 && shown.length < results.length && (
        <p className="muted small result-count">Showing {shown.length} of {results.length}</p>
      )}
      {hasResults && shown.length === 0 && (
        <p className="empty">
          No results match these filters.{' '}
          <button type="button" className="link-button" onClick={clearFilters}>Clear filters</button>
        </p>
      )}

      {hasResults && shown.length > 0 && (
        <ul className="result-list">
          {shown.map(result => (
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
