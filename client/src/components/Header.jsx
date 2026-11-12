import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { initials } from '../format.js';

// top bar of the logged-in pages
export default function Header() {
  const { name, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/lists" className="logo">NextUp</Link>
      <div className="account">
        <span className="avatar" title={name ?? ''}>{initials(name ?? '')}</span>
        <button className="link-button" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
