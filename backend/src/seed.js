require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db/init');
const { recomputeScoreForUser } = require('./services/scoringEngine');

async function seed() {
  const trackId = (slug) => db.prepare('SELECT id FROM tracks WHERE slug = ?').get(slug).id;

  const demoUsers = [
    { name: 'Aanya Sharma', email: 'aanya@example.com', role: 'student', track: 'web-dev', degree: 'B.Tech Computer Science', institution: 'RankArena Institute', headline: 'Frontend developer building React products', location: 'Bengaluru, India' },
    { name: 'Rahul Verma', email: 'rahul@example.com', role: 'student', track: 'dsa-cp', degree: 'B.Tech Information Technology', institution: 'Code Valley University', headline: 'Competitive programmer and backend learner', location: 'Pune, India' },
    { name: 'Priya Nair', email: 'priya@example.com', role: 'professional', track: 'ai-ml', degree: 'M.Tech AI', institution: 'National Tech School', headline: 'Machine learning engineer shipping applied AI systems', location: 'Hyderabad, India' },
    { name: 'Karthik Iyer', email: 'karthik@example.com', role: 'professional', track: 'cloud-devops', degree: 'B.E. Computer Engineering', institution: 'Cloud Systems College', headline: 'DevOps engineer focused on reliable infrastructure', location: 'Chennai, India' },
  ];

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const u of demoUsers) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
    let userId;
    if (existing) {
      userId = existing.id;
      db.prepare(
        `UPDATE users SET headline = COALESCE(NULLIF(headline, ''), ?), degree = COALESCE(NULLIF(degree, ''), ?),
         institution = COALESCE(NULLIF(institution, ''), ?), location = COALESCE(NULLIF(location, ''), ?),
         bio = COALESCE(NULLIF(bio, ''), ?), avatar_url = COALESCE(NULLIF(avatar_url, ''), ?)
         WHERE id = ?`
      ).run(u.headline, u.degree, u.institution, u.location, 'I use RankArena to track public work, projects, and daily consistency.', `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.name)}`, userId);
    } else {
      const result = db
        .prepare(
          `INSERT INTO users (name, email, password_hash, role, primary_track_id, headline, degree, institution, location, bio, avatar_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          u.name,
          u.email,
          passwordHash,
          u.role,
          trackId(u.track),
          u.headline,
          u.degree,
          u.institution,
          u.location,
          'I use RankArena to track public work, projects, and daily consistency.',
          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.name)}`
        );
      userId = result.lastInsertRowid;
    }

    // Sample project
    const hasProject = db.prepare('SELECT id FROM projects WHERE user_id = ?').get(userId);
    if (!hasProject) {
      db.prepare(
        `INSERT INTO projects (user_id, title, description, tech_stack, repo_url, track_id, stars)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        `${u.name.split(' ')[0]}'s Capstone Project`,
        'A demo project seeded for the leaderboard preview.',
        'React, Node.js, PostgreSQL',
        'https://github.com/example/demo-repo',
        trackId(u.track),
        Math.floor(Math.random() * 40)
      );
    }

    // Sample achievement
    const hasAch = db.prepare('SELECT id FROM achievements WHERE user_id = ?').get(userId);
    if (!hasAch) {
      db.prepare(
        `INSERT INTO achievements (user_id, title, type, issuer, achieved_on, track_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(userId, 'Hackathon Finalist', 'hackathon_participation', 'Demo Hacks 2026', '2026-03-15', trackId(u.track));
    }

    const hasDaily = db.prepare('SELECT id FROM daily_logs WHERE user_id = ?').get(userId);
    if (!hasDaily) {
      const insertDaily = db.prepare(
        `INSERT INTO daily_logs (user_id, log_date, title, category, minutes, impact, notes, track_id)
         VALUES (?, date('now', ?), ?, ?, ?, ?, ?, ?)`
      );
      insertDaily.run(userId, '-0 days', 'Shipped a feature and reviewed open issues', 'project', 95, 4, 'Daily demo activity.', trackId(u.track));
      insertDaily.run(userId, '-1 days', 'Solved practice problems and documented notes', 'coding', 70, 3, 'Daily demo activity.', trackId(u.track));
      insertDaily.run(userId, '-3 days', 'Contributed to a public repository discussion', 'open_source', 45, 3, 'Daily demo activity.', trackId(u.track));
    }

    const hasPost = db.prepare('SELECT id FROM posts WHERE user_id = ?').get(userId);
    if (!hasPost) {
      db.prepare('INSERT INTO posts (user_id, body, post_type, link_url, points) VALUES (?, ?, ?, ?, ?)').run(
        userId,
        `Shared progress on ${u.track}: shipped work, learned in public, and logged the proof on RankArena.`,
        'learning',
        '',
        6
      );
    }

    recomputeScoreForUser(userId);
  }

  const hasJob = db.prepare('SELECT id FROM jobs').get();
  if (!hasJob) {
    const insertJob = db.prepare(
      `INSERT INTO jobs (title, company, location, job_type, domain, description, apply_url, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertJob.run('Frontend Intern', 'Arena Labs', 'Remote', 'Internship', 'Web Development', 'Build React dashboards and reusable UI components.', 'https://example.com/frontend-intern', null);
    insertJob.run('Junior ML Engineer', 'SignalWorks AI', 'Bengaluru', 'Full-time', 'AI / Machine Learning', 'Train, evaluate, and ship applied ML features.', 'https://example.com/ml-engineer', null);
    insertJob.run('Open Source Contributor', 'PublicStack', 'Remote', 'Contract', 'Open Source', 'Improve documentation, issues, and starter projects.', 'https://example.com/open-source', null);
  }

  console.log('Seed complete. Demo login: aanya@example.com / password123 (and similar for others).');
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
