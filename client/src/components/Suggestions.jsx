import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import Skeleton from './Skeleton.jsx';
import SuggestionCard from './SuggestionCard.jsx';

const TABS = [
  { value: 'book', label: 'Books' },
  { value: 'movie', label: 'Movies' },
];

// the Suggestions section under my lists: popular books or movies, each one with "+ Add"
// lists and setLists come from MyListsPage, so adding a title here updates the list card above
export default function Suggestions({ lists, setLists }) {
  const [category, setCategory] = useState('book'); // the pill that's on
  const [chosen, setChosen] = useState(''); // the list picked in the select ('' = not picked yet)
  // one useApi per tab (both in the cache, so coming back shows them right away), the pill only picks which one i show
  // (with one useApi whose path changes, the old tab's cards stayed on screen for a moment)
  const books = useApi('/api/suggestions/books');
  const movies = useApi('/api/suggestions/movies');
  const { data: suggestions, error } = category === 'book' ? books : movies;

  const myLists = lists.filter(list => list.category === category); // only lists of this category
  // the picked list if it belongs to this tab, otherwise the newest one (lists come newest first)
  const listId = myLists.some(list => list._id === chosen) ? chosen : myLists[0]?._id;
  const word = category === 'book' ? 'Books' : 'Movies';

  // the card above gets +1 and the new cover first, without loading My Lists again (map + spread)
  function handleAdded(addedTo, item) {
    setLists(prev => prev.map(list =>
      list._id === addedTo
        ? { ...list, count: list.count + 1, covers: [item.imageUrl, ...list.covers].filter(Boolean).slice(0, 3) }
        : list
    ));
  }

  // key={listId} on the grid: another list picked --> new cards --> the "✓ Added" start over
  return (
    <section className="suggestions" aria-labelledby="suggestions-title">
      <h2 id="suggestions-title">Suggestions</h2>
      <div className="suggestions-bar">
        <div className="filters" role="group" aria-label="Suggestions to show">
          {TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              className={`pill pill-${tab.value}`}
              aria-pressed={category === tab.value}
              onClick={() => setCategory(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {myLists.length > 0 ? (
          <div className="field field-inline">
            <label htmlFor="add-to">Add to:</label>
            <select id="add-to" value={listId} onChange={e => setChosen(e.target.value)}>
              {myLists.map(list => <option key={list._id} value={list._id}>{list.name}</option>)}
            </select>
          </div>
        ) : (
          <p className="muted small">Create a {word} list to add suggestions.</p>
        )}
      </div>

      {error && <p className="error" role="alert">{error.message}</p>}
      {!suggestions && !error && <Skeleton type="cards" count={4} />}
      {suggestions && (
        <ul className="suggestion-grid" key={listId}>
          {suggestions.map(item => (
            <SuggestionCard key={item.externalId} item={item} listId={listId} onAdded={handleAdded} />
          ))}
        </ul>
      )}
    </section>
  );
}
