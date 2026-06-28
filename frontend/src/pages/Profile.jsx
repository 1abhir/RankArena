import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import ScoreRadar from '../components/ScoreRadar';
import AchievementCard from '../components/AchievementCard';
import { getTier } from '../components/tier';

export default function Profile() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get(`/users/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <div className="px-6 py-20 text-center text-ash">Loading profile...</div>;

  const { user, social, projects, achievements, daily = [], posts = [], score } = data;
  const tier = score ? getTier(score.total_score) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <section className="rounded-xl border border-hair bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface2">
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-bone">{user.name}</h1>
              <p className="mt-1 text-sm text-bone">{user.headline || (user.role === 'professional' ? 'Professional' : 'Student')}</p>
              <p className="mt-1 text-sm text-ash">{user.degree || 'Degree not added'} {user.institution ? `at ${user.institution}` : ''}</p>
              <p className="mt-1 text-sm text-ash">{user.location || 'Location not added'}</p>
            </div>
          </div>
          {score && (
            <div className="text-right">
              <p className="font-mono-num text-3xl font-bold" style={{ color: tier.color }}>{Math.round(score.total_score)}</p>
              <p className="text-xs font-medium" style={{ color: tier.color }}>{tier.name} tier</p>
            </div>
          )}
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-ash">{user.bio || 'No description added yet.'}</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Score breakdown</h2>
          {score ? <ScoreRadar score={score} /> : <p className="mt-3 text-sm text-ash">No score yet.</p>}
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Connected platforms</h2>
          <div className="mt-3 space-y-2">
            {social.length === 0 && <p className="text-sm text-ash">No platforms linked yet.</p>}
            {social.map((s) => (
              <div key={s.platform} className="flex items-center justify-between rounded-md bg-surface2 px-3 py-2">
                <span className="text-sm capitalize text-bone">{s.platform}</span>
                <span className="text-xs text-ash">@{s.handle}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Posts</h2>
          <div className="mt-3 space-y-2">
            {posts.length === 0 && <p className="text-sm text-ash">No posts yet.</p>}
            {posts.map((post) => (
              <div key={post.id} className="rounded-md bg-surface2 px-3 py-2">
                <p className="text-sm text-bone">{post.body}</p>
                <p className="mt-1 text-xs text-signal">+{post.points} pts - {post.post_type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Achievements</h2>
          <div className="mt-3 space-y-2">
            {achievements.length === 0 && <p className="text-sm text-ash">No achievements logged yet.</p>}
            {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Projects</h2>
          <div className="mt-3 space-y-2">
            {projects.length === 0 && <p className="text-sm text-ash">No projects logged yet.</p>}
            {projects.map((p) => (
              <a key={p.id} href={p.repo_url || '#'} target="_blank" rel="noreferrer" className="block rounded-md bg-surface2 px-3 py-2 hover:bg-surface">
                <p className="text-sm font-semibold text-bone">{p.title}</p>
                <p className="text-xs text-ash">{p.tech_stack}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Recent daily work</h2>
          <div className="mt-3 space-y-2">
            {daily.length === 0 && <p className="text-sm text-ash">No daily work logged yet.</p>}
            {daily.map((item) => (
              <div key={item.id} className="rounded-md bg-surface2 px-3 py-2">
                <p className="text-sm font-semibold text-bone">{item.title}</p>
                <p className="mt-1 text-xs text-ash">{item.category.replace(/_/g, ' ')} - {item.minutes} min - impact {item.impact}/5</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
