import Cover from './Cover.jsx';
import StarRating from './StarRating.jsx';
import { STATUS_LABELS } from '../labels.js';

// one title in a list. it doesn't change anything itself: it calls the parent (data down, events up)
export default function ItemCard({ item, category, onChange, onRemove }) {
  const labels = STATUS_LABELS[category];
  const details = [item.author, item.year].filter(Boolean).join(' · '); // "Jane Austen · 1813"
  const statusClass = `status status-${item.status.replace(' ', '-')}`; // 'in progress' --> status-in-progress

  return (
    <li className="item-card">
      <Cover src={item.imageUrl} />
      <div className="item-info">
        <h2 className="item-title">{item.title}</h2>
        {details && <p className="muted small">{details}</p>}
        <div className="item-controls">
          <select
            className={statusClass}
            value={item.status}
            aria-label={`Status of ${item.title}`}
            onChange={e => onChange(item._id, { status: e.target.value })}
          >
            {Object.keys(labels).map(status => (
              <option key={status} value={status}>{labels[status]}</option>
            ))}
          </select>
          <StarRating rating={item.rating} onRate={rating => onChange(item._id, { rating })} />
        </div>
      </div>
      <button className="icon-button" aria-label={`Remove ${item.title}`} onClick={() => onRemove(item._id)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" />
        </svg>
      </button>
    </li>
  );
}
