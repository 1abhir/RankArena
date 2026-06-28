import { useEffect, useState } from 'react';
import client from '../api/client';
import RankBar from '../components/RankBar';
import TrackTabs from '../components/TrackTabs';

export default function Leaderboard() {
  const [tracks, setTracks] = useState([]);
  const [track, setTrack] = useState('');
  const [role, setRole] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/users/tracks').then((res) => setTracks(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (track) params.track = track;
    if (role) params.role = role;
    client
      .get('/leaderboard', { params })
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, [track, role]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-bone">Domain leaderboard</h1>
      <p className="mt-1 text-sm text-ash">
        Ranked by GitHub, competitive coding, achievements, projects, LinkedIn proof, and daily work.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <TrackTabs tracks={tracks} active={track} onChange={setTrack} />
        <div className="flex gap-2">
          {['', 'student', 'professional'].map((r) => (
            <button
              key={r || 'all'}
              onClick={() => setRole(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                role === r ? 'bg-surface2 text-signal' : 'text-ash hover:text-bone'
              }`}
            >
              {r || 'Everyone'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {loading && <p className="text-sm text-ash">Loading ladder...</p>}
        {!loading && rows.length === 0 && (
          <p className="rounded-lg border border-hair bg-surface px-4 py-8 text-center text-sm text-ash">
            No one has a score on this filter yet. Be the first to sign up, sync your stats, and log daily work.
          </p>
        )}
        {rows.map((entry) => <RankBar key={entry.id} entry={entry} />)}
      </div>
    </div>
  );
}
