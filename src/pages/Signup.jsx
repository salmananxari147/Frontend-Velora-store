import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Signup() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/account'} replace />;

  return (
    <div className="signin">
      <aside className="signin-brand">
        <Link to="/" className="logo" aria-label="VELORA home">
          <span>VELORA</span>
          <small>Move Different</small>
        </Link>
        <h1>Join us</h1>
        <p>Save your pairs, track orders, and check out faster.</p>
      </aside>
      <form
        className="signin-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');
          try {
            await register(form);
            navigate('/account');
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        <p className="eyebrow">Account</p>
        <h2>Create account</h2>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          Name
          <input
            required
            autoComplete="name"
            placeholder="Your full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="field">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="name@email.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
