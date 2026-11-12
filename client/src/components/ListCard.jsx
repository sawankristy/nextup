import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge.jsx';
import { plural } from '../format.js';

// one card on the My Lists page, the whole card is a link to the list
export default function ListCard({ list }) {
  return (
    <Link to={`/lists/${list._id}`} className="list-card">
      <div className={`covers covers-${list.category}`} aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h2 className="list-card-name">{list.name}</h2>
      <div className="list-card-footer">
        <CategoryBadge category={list.category} />
        <span className="muted small">{plural(list.count, 'title')}</span>
      </div>
    </Link>
  );
}
