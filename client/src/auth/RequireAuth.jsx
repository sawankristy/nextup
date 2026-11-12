import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// wraps a protected page: no token --> go to the login page instead
export default function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
