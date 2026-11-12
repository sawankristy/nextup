import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function LoginPage() {
  const { token, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // already logged in (or just logged in) --> straight to my lists
  if (token) return <Navigate to="/lists" replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and your password');
      return;
    }
    setSending(true);
    try {
      await login(form.email.trim(), form.password);
      // the token changes --> this page re-renders --> <Navigate> above sends me to /lists
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <AuthLayout>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button button-wide" disabled={sending}>
          {sending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="switch">No account yet? <Link to="/signup">Sign up</Link></p>
    </AuthLayout>
  );
}
