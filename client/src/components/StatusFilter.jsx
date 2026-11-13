import { STATUS_LABELS } from '../labels.js';

// the pills above the titles: All · To read · Reading · Done, each one with its count
// the chosen filter lives in ListPage (lifting state up), this only shows it and reports the clicks
export default function StatusFilter({ category, items, selected, onSelect }) {
  const labels = STATUS_LABELS[category];
  const pills = [
    { value: 'all', label: 'All', count: items.length },
    ...Object.keys(labels).map(status => ({
      value: status,
      label: labels[status],
      count: items.filter(item => item.status === status).length,
    })),
  ];

  // aria-pressed tells a screen reader which pill is on
  // 'in progress' --> class pill-in-progress (same trick as the status in ItemCard)
  return (
    <div className="filters" role="group" aria-label="Show titles by status">
      {pills.map(pill => (
        <button
          key={pill.value}
          type="button"
          className={`pill pill-${pill.value.replace(' ', '-')}`}
          aria-pressed={selected === pill.value}
          onClick={() => onSelect(pill.value)}
        >
          {pill.label} <span className="pill-count">{pill.count}</span>
        </button>
      ))}
    </div>
  );
}
