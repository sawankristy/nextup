import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge.jsx';
import { plural } from '../format.js';

// one card on the My Lists page, the whole card is a link to the list
// on top: the real covers of the 3 newest titles (the server sends them in list.covers)
export default function ListCard({ list }) {
  return (
    <Link to={`/lists/${list._id}`} className="list-card">
      <div className="card-covers" aria-hidden="true">
        {list.covers.length > 0 ? (
          // index as key is ok here, the covers never move around on screen
          list.covers.map((url, i) => (
            <img key={i} src={url} alt="" width="44" height="64" loading="lazy" />
          ))
        ) : (
          <p className="card-covers-empty muted small">
            <span className="card-covers-icon">{list.category === 'book' ? '📚' : '🎬'}</span>
            {list.count === 0 ? 'No titles yet' : 'No covers'}
          </p>
        )}
      </div>
      <h2 className="list-card-name">{list.name}</h2>
      <div className="list-card-footer">
        <CategoryBadge category={list.category} />
        <span className="muted small">{plural(list.count, 'title')}</span>
      </div>
    </Link>
  );
}
