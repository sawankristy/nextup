import { useState } from 'react';
import Cover from './Cover.jsx';

// one row in the search results: "Add", or "✓ Added" if it's already in the list
export default function SearchResult({ result, added, onAdd }) {
  const [adding, setAdding] = useState(false); // stops a double click from adding it twice
  const details = [result.author, result.year].filter(Boolean).join(' · ');

  async function handleAdd() {
    setAdding(true);
    await onAdd(result);
    setAdding(false);
  }

  return (
    <li className="result-row">
      <Cover src={result.imageUrl} small />
      <div className="result-info">
        <p className="item-title">{result.title}</p>
        {details && <p className="muted small">{details}</p>}
      </div>
      {added ? (
        <span className="added">✓ Added</span>
      ) : (
        <button className="button button-secondary" onClick={handleAdd} disabled={adding}>Add</button>
      )}
    </li>
  );
}
