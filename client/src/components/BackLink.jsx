import { Link } from 'react-router-dom';

// "‹ My Lists" at the top of a page
export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {children}
    </Link>
  );
}
