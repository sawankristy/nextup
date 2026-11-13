import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { clearApiCache } from '../hooks/useApi.js';

const AuthContext = createContext(null);

// useAuth stays next to its context, like in session 20 (the linter wants it in another file)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// who is logged in = state, shared with the whole app through Context
// localStorage --> survives a refresh, useState --> re-renders. i write to both and clear both
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [name, setName] = useState(() => localStorage.getItem('name'));

  function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.user.name);
    setToken(data.token);
    setName(data.user.name);
  }

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveSession(data);
  }

  // form = { name, email, password }
  async function signup(form) {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    saveSession(data);
  }

  // useCallback so it stays the same function for the effect below
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    clearApiCache(); // the next user must not see my lists
    setToken(null);
    setName(null);
  }, []);

  // the token died in the middle of something --> apiFetch fires auth:expired --> log out
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const value = { token, name, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
