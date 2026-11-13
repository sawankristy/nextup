// grey blocks in the same layout as the real content, while it loads (better than a lonely "Loading…")
// type: 'cards' = list cards (My Lists), 'items' = titles of a list, 'rows' = search results
// role="status" + the hidden text: a screen reader still says "Loading…"
export default function Skeleton({ type = 'items', count = 3, title = false }) {
  const blocks = Array.from({ length: count }, (_, i) => i); // count 3 --> [0, 1, 2]
  const isCards = type === 'cards';

  return (
    <div role="status" className={`skeleton skeleton-${type}`}>
      <span className="visually-hidden">Loading…</span>
      {title && <div className="sk sk-title"></div>}
      <div className={isCards ? 'list-grid' : 'item-list'}>
        {blocks.map(i => (
          <div key={i} className={isCards ? 'list-card' : 'item-card'}>
            <div className={isCards ? 'sk sk-covers' : 'sk cover'}></div>
            <div className="sk-lines">
              <div className="sk sk-line"></div>
              <div className="sk sk-line sk-short"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
