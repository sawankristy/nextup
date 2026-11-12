import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function HomePage() {
  const { token } = useAuth();

  return (
    <AuthLayout>
      <ul className="home-points">
        <li>Make your own lists of <b>books</b> or <b>movies</b>.</li>
        <li>Search Open Library and TMDB, and add a title in one click.</li>
        <li>Mark what you're reading or watching, and rate it out of 5.</li>
      </ul>

      {/* logged in --> one button to the lists, otherwise sign up / log in */}
      {token ? (
        <Link to="/lists" className="button button-wide">Go to my lists</Link>
      ) : (
        <div className="home-actions">
          <Link to="/signup" className="button button-wide">Sign up</Link>
          <Link to="/login" className="button button-secondary button-wide">Log in</Link>
        </div>
      )}
    </AuthLayout>
  );
}
