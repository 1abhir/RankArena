import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ScoreRadar from '../components/ScoreRadar';
import AchievementCard from '../components/AchievementCard';
import { getTier } from '../components/tier';

const PLATFORMS = [
  { key: 'github', label: 'GitHub', placeholder: 'octocat' },
  { key: 'codeforces', label: 'Codeforces', placeholder: 'tourist' },
  { key: 'leetcode', label: 'LeetCode', placeholder: 'leetcoder123' },
];

const DAILY_CATEGORIES = ['coding', 'open_source', 'project', 'learning', 'interview_prep', 'content', 'other'];

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [daily, setDaily] = useState([]);
  const [handles, setHandles] = useState({ github: '', codeforces: '', leetcode: '', github_token: '' });
  const [linkedin, setLinkedin] = useState({ followers: '', endorsements: '', recommendations: '', posts_last_90d: '' });
  const [profileForm, setProfileForm] = useState({
    name: '',
    headline: '',
    degree: '',
    institution: '',
    location: '',
    bio: '',
    avatar_url: '',
  });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [achForm, setAchForm] = useState({ title: '', type: 'hackathon_win', issuer: '', achieved_on: '' });
  const [projForm, setProjForm] = useState({ title: '', description: '', tech_stack: '', repo_url: '', stars: 0 });
  const [dailyForm, setDailyForm] = useState({
    title: '',
    category: 'coding',
    minutes: 60,
    impact: 3,
    notes: '',
    log_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    client.get('/users/tracks').then((res) => setTracks(res.data));
  }, []);

  useEffect(() => {
    if (!user) return;
    client.get(`/users/${user.user.id}`).then((res) => {
      setAchievements(res.data.achievements);
      setProjects(res.data.projects);
      setDaily(res.data.daily || []);
    });
    setProfileForm({
      name: user.user.name || '',
      headline: user.user.headline || '',
      degree: user.user.degree || '',
      institution: user.user.institution || '',
      location: user.user.location || '',
      bio: user.user.bio || '',
      avatar_url: user.user.avatar_url || '',
    });
    const map = {};
    user.social.forEach((s) => {
      map[s.platform] = s.handle;
    });
    setHandles((h) => ({ ...h, ...map }));
  }, [user]);

  if (!user) return <div className="px-6 py-20 text-center text-ash">Loading...</div>;

  const score = user.score;
  const tier = score ? getTier(score.total_score) : null;

  async function linkPlatform(platform) {
    const handle = handles[platform];
    if (!handle) return;
    await client.post('/social/link', { platform, handle, github_token: handles.github_token });
    await syncOne(platform);
  }

  async function syncOne(platform) {
    setSyncing(true);
    setSyncMsg(`Syncing ${platform}...`);
    try {
      await client.post(`/sync/${platform}`);
      setSyncMsg(`${platform} synced`);
      await refresh();
    } catch (err) {
      setSyncMsg(err.response?.data?.error || `Could not sync ${platform}`);
    } finally {
      setSyncing(false);
    }
  }

  async function syncAll() {
    setSyncing(true);
    setSyncMsg('Syncing all linked platforms...');
    try {
      await client.post('/sync');
      setSyncMsg('All platforms synced');
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  async function saveLinkedin(e) {
    e.preventDefault();
    await client.put('/social/linkedin', linkedin);
    await refresh();
  }

  async function saveProfile(e) {
    e.preventDefault();
    await client.put('/users/me', profileForm);
    await refresh();
  }

  async function addAchievement(e) {
    e.preventDefault();
    const res = await client.post('/achievements', achForm);
    setAchievements([res.data, ...achievements]);
    setAchForm({ title: '', type: 'hackathon_win', issuer: '', achieved_on: '' });
    await refresh();
  }

  async function addProject(e) {
    e.preventDefault();
    const res = await client.post('/projects', projForm);
    setProjects([res.data, ...projects]);
    setProjForm({ title: '', description: '', tech_stack: '', repo_url: '', stars: 0 });
    await refresh();
  }

  async function addDailyLog(e) {
    e.preventDefault();
    const res = await client.post('/daily', dailyForm);
    setDaily([res.data, ...daily].slice(0, 7));
    setDailyForm({
      title: '',
      category: 'coding',
      minutes: 60,
      impact: 3,
      notes: '',
      log_date: new Date().toISOString().slice(0, 10),
    });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">Hey, {user.user.name.split(' ')[0]}</h1>
          <p className="text-sm text-ash">
            {user.user.role === 'professional' ? 'Professional' : 'Student'} dashboard for daily work, projects, and public proof
          </p>
        </div>
        {score && (
          <div className="rounded-lg border border-hair bg-surface px-5 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-ash">Total score</p>
            <p className="font-mono-num text-3xl font-bold" style={{ color: tier.color }}>{Math.round(score.total_score)}</p>
            <p className="text-xs font-medium" style={{ color: tier.color }}>{tier.name} tier</p>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-hair bg-surface p-5 lg:col-span-2">
          <div className="flex flex-wrap gap-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface2">
              {profileForm.avatar_url ? <img src={profileForm.avatar_url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <form onSubmit={saveProfile} className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h2 className="font-display font-semibold text-bone">Profile</h2>
                <p className="mt-1 text-xs text-ash">Add LinkedIn-style details that show on your public RankArena profile.</p>
              </div>
              <input
                placeholder="Full name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                placeholder="Headline (e.g. React Developer)"
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                placeholder="Degree"
                value={profileForm.degree}
                onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                placeholder="College / institution"
                value={profileForm.institution}
                onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                placeholder="Location"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                placeholder="Profile photo URL"
                value={profileForm.avatar_url}
                onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <textarea
                placeholder="About / description"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={2}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal sm:col-span-2"
              />
              <button className="rounded-md bg-signal py-1.5 text-sm font-medium text-ink sm:col-span-2">
                Save profile
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Score breakdown</h2>
          {score ? <ScoreRadar score={score} /> : <p className="mt-4 text-sm text-ash">Sync a platform or log daily work to see your breakdown.</p>}
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-bone">Connect platforms</h2>
            <button onClick={syncAll} disabled={syncing} className="text-xs text-signal disabled:opacity-50">
              Sync all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {PLATFORMS.map((p) => (
              <div key={p.key} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-sm text-ash">{p.label}</span>
                <input
                  value={handles[p.key]}
                  onChange={(e) => setHandles({ ...handles, [p.key]: e.target.value })}
                  placeholder={p.placeholder}
                  className="flex-1 rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
                />
                <button
                  onClick={() => linkPlatform(p.key)}
                  disabled={syncing}
                  className="rounded-md border border-hair px-3 py-1.5 text-xs text-bone hover:border-signal disabled:opacity-50"
                >
                  Link & sync
                </button>
              </div>
            ))}
            {syncMsg && <p className="text-xs text-ash">{syncMsg}</p>}
            <p className="text-xs text-ash">
              GitHub token is optional. It improves rate limits but is never required for public stats.
            </p>
            <input
              value={handles.github_token}
              onChange={(e) => setHandles({ ...handles, github_token: e.target.value })}
              placeholder="GitHub token (optional)"
              type="password"
              className="w-full rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Log today's work</h2>
          <form onSubmit={addDailyLog} className="mt-3 space-y-2">
            <input
              required
              placeholder="What did you do today?"
              value={dailyForm.title}
              onChange={(e) => setDailyForm({ ...dailyForm, title: e.target.value })}
              className="w-full rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                value={dailyForm.category}
                onChange={(e) => setDailyForm({ ...dailyForm, category: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              >
                {DAILY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Minutes"
                value={dailyForm.minutes}
                onChange={(e) => setDailyForm({ ...dailyForm, minutes: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Impact 1-5"
                value={dailyForm.impact}
                onChange={(e) => setDailyForm({ ...dailyForm, impact: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
            </div>
            <input
              type="date"
              value={dailyForm.log_date}
              onChange={(e) => setDailyForm({ ...dailyForm, log_date: e.target.value })}
              className="w-full rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <button className="w-full rounded-md bg-signal py-1.5 text-sm font-medium text-ink hover:bg-signal/90">
              Add daily work
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {daily.length === 0 && <p className="text-sm text-ash">No daily work logged yet.</p>}
            {daily.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg border border-hair bg-surface2 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-bone">{item.title}</p>
                  <span className="shrink-0 font-mono-num text-xs text-signal">{item.log_date}</span>
                </div>
                <p className="mt-1 text-xs text-ash">
                  {item.category.replace(/_/g, ' ')} - {item.minutes} min - impact {item.impact}/5
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">LinkedIn proof</h2>
          <p className="mt-1 text-xs text-ash">LinkedIn is self-reported because profile scraping is not allowed.</p>
          <form onSubmit={saveLinkedin} className="mt-3 grid grid-cols-2 gap-2">
            {['followers', 'endorsements', 'recommendations', 'posts_last_90d'].map((field) => (
              <input
                key={field}
                type="number"
                min="0"
                placeholder={field.replace(/_/g, ' ')}
                value={linkedin[field]}
                onChange={(e) => setLinkedin({ ...linkedin, [field]: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
            ))}
            <button className="col-span-2 rounded-md border border-hair py-1.5 text-sm text-bone hover:border-signal">
              Save LinkedIn stats
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5">
          <h2 className="font-display font-semibold text-bone">Log an achievement</h2>
          <form onSubmit={addAchievement} className="mt-3 space-y-2">
            <input
              required
              placeholder="Title (e.g. Smart India Hackathon Winner)"
              value={achForm.title}
              onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
              className="w-full rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <div className="flex gap-2">
              <select
                value={achForm.type}
                onChange={(e) => setAchForm({ ...achForm, type: e.target.value })}
                className="flex-1 rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              >
                {['hackathon_win', 'hackathon_participation', 'certification', 'internship', 'publication', 'award', 'other'].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="date"
                value={achForm.achieved_on}
                onChange={(e) => setAchForm({ ...achForm, achieved_on: e.target.value })}
                className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
              />
            </div>
            <input
              placeholder="Issuer / organizer"
              value={achForm.issuer}
              onChange={(e) => setAchForm({ ...achForm, issuer: e.target.value })}
              className="w-full rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <button className="w-full rounded-md bg-signal py-1.5 text-sm font-medium text-ink hover:bg-signal/90">
              Add achievement
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {achievements.slice(0, 4).map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        </section>

        <section className="rounded-xl border border-hair bg-surface p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-bone">Log a project</h2>
          <form onSubmit={addProject} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              required
              placeholder="Project title"
              value={projForm.title}
              onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
              className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal sm:col-span-2"
            />
            <input
              placeholder="Tech stack (comma separated)"
              value={projForm.tech_stack}
              onChange={(e) => setProjForm({ ...projForm, tech_stack: e.target.value })}
              className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <input
              placeholder="Repo URL"
              value={projForm.repo_url}
              onChange={(e) => setProjForm({ ...projForm, repo_url: e.target.value })}
              className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal"
            />
            <textarea
              placeholder="What does it do?"
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
              className="rounded-md border border-hair bg-surface2 px-2 py-1.5 text-sm text-bone outline-none focus:border-signal sm:col-span-2"
              rows={2}
            />
            <button className="rounded-md bg-signal py-1.5 text-sm font-medium text-ink hover:bg-signal/90 sm:col-span-2">
              Add project
            </button>
          </form>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="rounded-lg border border-hair bg-surface2 px-3 py-2">
                <p className="text-sm font-semibold text-bone">{p.title}</p>
                <p className="text-xs text-ash">{p.tech_stack}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
