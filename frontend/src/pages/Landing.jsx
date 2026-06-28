import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="font-mono-num text-xs uppercase tracking-[0.2em] text-signal">
            Students & Professionals - One Domain Ladder
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-bone">
            Your work, <span className="text-signal">scored.</span><br />Your rank, <span className="text-signal">earned.</span>
          </h1>
          <p className="mt-5 max-w-md text-ash">
            RankArena combines GitHub, competitive coding, LinkedIn-style proof,
            public contributions, projects, achievements, and daily work logs
            into one transparent leaderboard for your domain.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/signup" className="rounded-md bg-signal px-5 py-3 font-medium text-ink transition-colors hover:bg-signal/90">
              Get ranked
            </Link>
            <Link to="/leaderboard" className="rounded-md border border-hair px-5 py-3 font-medium text-bone transition-colors hover:border-signal/40">
              View leaderboard
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-hair bg-surface p-5">
          <p className="mb-3 text-xs uppercase tracking-wide text-ash">Live ladder preview</p>
          {[
            { rank: 1, name: 'Priya Nair', track: 'AI / Machine Learning', score: 842, tier: '#B79CF2' },
            { rank: 2, name: 'Karthik Iyer', track: 'Cloud & DevOps', score: 731, tier: '#7FD8E0' },
            { rank: 3, name: 'Rahul Verma', track: 'DSA & CP', score: 588, tier: '#E8B94B' },
          ].map((r) => (
            <div key={r.rank} className="mb-2 flex items-center gap-3 rounded-md bg-surface2 px-3 py-2">
              <span className="font-mono-num text-sm text-ash">{String(r.rank).padStart(2, '0')}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-bone">{r.name}</p>
                <p className="text-xs text-ash">{r.track}</p>
              </div>
              <span className="font-mono-num text-base font-bold" style={{ color: r.tier }}>{r.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 grid gap-6 sm:grid-cols-3">
        {[
          { n: '01', t: 'Connect', d: 'Link GitHub, Codeforces, LeetCode, and add LinkedIn-style professional proof.' },
          { n: '02', t: 'Log daily work', d: 'Record shipped work, learning, open-source activity, and project progress every day.' },
          { n: '03', t: 'Climb', d: "See exactly where you stand on your domain's leaderboard and what to improve." },
        ].map((s) => (
          <div key={s.n} className="rounded-lg border border-hair p-5">
            <p className="font-mono-num text-xs text-signal">{s.n}</p>
            <p className="mt-2 font-display font-semibold text-bone">{s.t}</p>
            <p className="mt-1 text-sm text-ash">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
