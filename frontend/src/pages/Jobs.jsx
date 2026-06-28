import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', location: '', job_type: 'Full-time', domain: '', description: '', apply_url: '' });

  useEffect(() => {
    client.get('/jobs').then((res) => setJobs(res.data));
  }, []);

  async function postJob(e) {
    e.preventDefault();
    const res = await client.post('/jobs', form);
    setJobs([res.data, ...jobs]);
    setForm({ title: '', company: '', location: '', job_type: 'Full-time', domain: '', description: '', apply_url: '' });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1fr_340px]">
      <main>
        <h1 className="font-display text-3xl font-bold text-bone">Open jobs</h1>
        <p className="mt-1 text-sm text-ash">Browse and share roles for RankArena domains.</p>
        <div className="mt-6 space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-xl border border-hair bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-bone">{job.title}</h2>
                  <p className="text-sm text-ash">{job.company} - {job.location || 'Remote'} - {job.job_type}</p>
                </div>
                {job.apply_url && (
                  <a href={job.apply_url} target="_blank" rel="noreferrer" className="rounded-md bg-signal px-3 py-1.5 text-sm font-medium text-ink">
                    Apply
                  </a>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-bone">{job.description}</p>
              <p className="mt-3 text-xs text-signal">{job.domain || 'General'}</p>
            </article>
          ))}
        </div>
      </main>

      <aside className="rounded-xl border border-hair bg-surface p-5 lg:sticky lg:top-24 lg:h-fit">
        <h2 className="font-display font-semibold text-bone">Post a job</h2>
        <form onSubmit={postJob} className="mt-4 space-y-2">
          <input required placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <input placeholder="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <input placeholder="Apply URL" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-hair bg-surface2 px-3 py-2 text-sm text-bone outline-none focus:border-signal" />
          <button className="w-full rounded-md bg-signal py-2 text-sm font-medium text-ink">Share job</button>
        </form>
      </aside>
    </div>
  );
}
