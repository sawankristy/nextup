// blue "Books" badge or orange "Movies" badge
export default function CategoryBadge({ category }) {
  return (
    <span className={`badge badge-${category}`}>
      {category === 'book' ? 'Books' : 'Movies'}
    </span>
  );
}
