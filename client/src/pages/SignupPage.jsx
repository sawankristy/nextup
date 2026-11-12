import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

// same rules as the server checks (the server checks again, anyone can skip the browser)
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name';
  if (!form.email.includes('@')) errors.email = 'Enter a valid email';
  if (form.password.length < 8) errors.password = 'At least 8 characters';
  return errors;
}

export default function SignupPage() {
  const { token, signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);

  if (token) return <Navigate to="/lists" replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return; // has errors --> stop
    setSending(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    } catch (err) {
      setServerError(err.message); // like "Email already registered"
      setSending(false);
    }
  }

  return (
    <AuthLayout>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        {serverError && <p className="error" role="alert">{serverError}</p>}
        <button className="button button-wide" disabled={sending}>
          {sending ? 'Creating your account…' : 'Sign up'}
        </button>
      </form>
      <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}
