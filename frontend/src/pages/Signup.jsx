import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', primary_track_id: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get('/users/tracks').then((res) => setTracks(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup({ ...form, primary_track_id: form.primary_track_id || null });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign up');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-bone">Join the ladder</h1>
      <p className="mt-1 text-sm text-ash">Create your profile, choose a domain, then connect your platforms.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-ash">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-bone outline-none focus:border-signal"
          />
        </div>
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
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-bone outline-none focus:border-signal"
          />
        </div>
        <div className="flex gap-3">
          {['student', 'professional'].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                form.role === r ? 'border-signal text-signal' : 'border-hair text-ash'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-ash">Primary track</label>
          <select
            value={form.primary_track_id}
            onChange={(e) => setForm({ ...form, primary_track_id: e.target.value })}
            className="mt-1 w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-bone outline-none focus:border-signal"
          >
            <option value="">Select a track</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-md bg-signal py-2.5 font-medium text-ink transition-colors hover:bg-signal/90 disabled:opacity-50"
        >
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-ash">
        Already have an account? <Link to="/login" className="text-signal">Log in</Link>
      </p>
    </div>
  );
}
