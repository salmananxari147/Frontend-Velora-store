import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requested = params.get('next');
  const destination = (role) => {
    if (requested && requested !== '/account') return requested;
    return role === 'admin' ? '/admin' : '/account';
  };

  if (user) return <Navigate to={destination(user.role)} replace />;

  return (
    <div className="signin">
      <aside className="signin-brand">
        <Link to="/" className="logo" aria-label="VELORA home">
          <span>VELORA</span>
          <small>Move Different</small>
        </Link>
        <h1>Sign in</h1>
        <p>Orders, saved pairs, and your size — in one place.</p>
      </aside>
      <form
        className="signin-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');
          try {
            const signedIn = await login(form.email, form.password);
            navigate(destination(signedIn.role));
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        <p className="eyebrow">Account</p>
        <h2>Welcome back</h2>
        {error && <p className="form-error">{error}</p>}
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
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
