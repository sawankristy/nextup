import { useState } from 'react';
import { apiFetch } from '../api/client.js';

// one suggested title: cover, title, author · year, and "+ Add" to put it in the chosen list
// no listId (no list of this category yet) --> no button
export default function SuggestionCard({ item, listId, onAdded }) {
  const [status, setStatus] = useState('idle'); // idle / sending / added / already
  const [error, setError] = useState('');
  const details = [item.author, item.year].filter(Boolean).join(' · ');

  async function handleAdd() {
    setStatus('sending'); // the button is disabled while it sends
    setError('');
    try {
      await apiFetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      setStatus('added');
      onAdded(listId, item); // the list card above gets the new title
    } catch (err) {
      // the server's 409 message: it's already there, so it's not really an error
      if (err.message === 'Already in this list') {
        setStatus('already');
      } else {
        setStatus('idle');
        setError(err.message);
      }
    }
  }

  // alt="" because the title is written right under the cover
  return (
    <li className="suggestion-card">
      <img className="suggestion-cover" src={item.imageUrl} alt="" width="200" height="300" loading="lazy" />
      <p className="item-title">{item.title}</p>
      {details && <p className="muted small">{details}</p>}
      {status === 'added' && <span className="added">✓ Added</span>}
      {status === 'already' && <span className="added">✓ Already in this list</span>}
      {listId && (status === 'idle' || status === 'sending') && (
        <button className="button button-secondary" onClick={handleAdd} disabled={status === 'sending'}>
          + Add
        </button>
      )}
      {error && <p className="field-error">{error}</p>}
    </li>
  );
}
