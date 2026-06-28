import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = ['update', 'learning', 'project', 'achievement', 'open_source', 'hiring'];

export default function Home() {
  const { user, refresh } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ body: '', post_type: 'update', link_url: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get('/posts').then((res) => setPosts(res.data));
  }, []);

  async function submitPost(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await client.post('/posts', form);
      const me = user.user;
      setPosts([
        {
          ...res.data,
          name: me.name,
          headline: me.headline,
          avatar_url: me.avatar_url,
          track_name: '',
        },
        ...posts,
      ]);
      setForm({ body: '', post_type: 'update', link_url: '' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <main className="space-y-4">
        <section className="rounded-xl border border-hair bg-surface p-5">
          <h1 className="font-display text-2xl font-bold text-bone">Home</h1>
          <p className="mt-1 text-sm text-ash">Post professional updates, learning, project wins, and public contributions.</p>
          <form onSubmit={submitPost} className="mt-4 space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Share what you built, learned, contributed, or achieved..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal"
            />
            <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
              <select
                value={form.post_type}
                onChange={(e) => setForm({ ...form, post_type: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal"
              >
                {POST_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                placeholder="Optional proof link"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal"
              />
              <button disabled={busy} className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-ink disabled:opacity-50">
                Post
              </button>
            </div>
          </form>
        </section>

        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-hair bg-surface p-5">
            <div className="flex gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface2">
                {post.avatar_url ? <img src={post.avatar_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-semibold text-bone">{post.name}</p>
                    <p className="text-xs text-ash">{post.headline || post.track_name || 'RankArena member'}</p>
                  </div>
                  <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs text-signal">+{post.points} pts</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-bone">{post.body}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ash">
                  <span>{post.post_type.replace(/_/g, ' ')}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.link_url && <a href={post.link_url} target="_blank" rel="noreferrer" className="text-signal">Proof link</a>}
                </div>
              </div>
            </div>
          </article>
        ))}
      </main>

      <aside className="rounded-xl border border-hair bg-surface p-5 lg:sticky lg:top-24 lg:h-fit">
        <h2 className="font-display font-semibold text-bone">Post scoring</h2>
        <p className="mt-2 text-sm text-ash">Learning posts, project updates, achievements, and open-source proof add to your social score over the last 30 days.</p>
      </aside>
    </div>
  );
}
