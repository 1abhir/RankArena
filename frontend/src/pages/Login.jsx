import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not log in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-bone">Log in</h1>
      <p className="mt-1 text-sm text-ash">Demo accounts: aanya@example.com / password123</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-ash">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-bone outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="text-xs text-ash">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-bone outline-none focus:border-signal"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-md bg-signal py-2.5 font-medium text-ink transition-colors hover:bg-signal/90 disabled:opacity-50"
        >
          {busy ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-ash">
        No account? <Link to="/signup" className="text-signal">Sign up</Link>
      </p>
    </div>
  );
}
