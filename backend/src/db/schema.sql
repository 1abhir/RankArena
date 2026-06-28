-- RankArena database schema (SQLite)

CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'code'
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',     -- 'student' | 'professional'
  primary_track_id INTEGER REFERENCES tracks(id),
  headline TEXT DEFAULT '',
  degree TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  location TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,                   -- 'github' | 'codeforces' | 'leetcode' | 'linkedin'
  handle TEXT NOT NULL,                      -- username, handle, or profile URL
  github_token TEXT DEFAULT '',              -- only used for platform = 'github', optional, user-supplied
  raw_stats_json TEXT DEFAULT '{}',
  last_synced_at TEXT,
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_stack TEXT DEFAULT '',               -- comma separated
  repo_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  track_id INTEGER REFERENCES tracks(id),
  stars INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,                        -- hackathon_win | hackathon_participation | certification | internship | publication | award | other
  issuer TEXT DEFAULT '',
  achieved_on TEXT,
  proof_url TEXT DEFAULT '',
  track_id INTEGER REFERENCES tracks(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date TEXT NOT NULL DEFAULT (date('now')),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'learning', -- learning | coding | open_source | project | interview_prep | content | other
  minutes INTEGER DEFAULT 0,
  impact INTEGER DEFAULT 1,                  -- 1-5 self-rated impact
  notes TEXT DEFAULT '',
  track_id INTEGER REFERENCES tracks(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'update', -- update | project | achievement | open_source | learning | hiring
  link_url TEXT DEFAULT '',
  points INTEGER DEFAULT 5,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT '',
  job_type TEXT DEFAULT 'Full-time',
  domain TEXT DEFAULT '',
  description TEXT DEFAULT '',
  apply_url TEXT DEFAULT '',
  posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_open INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Self-reported LinkedIn engagement (no API scraping; user enters their own numbers)
CREATE TABLE IF NOT EXISTS linkedin_stats (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  followers INTEGER DEFAULT 0,
  endorsements INTEGER DEFAULT 0,
  recommendations INTEGER DEFAULT 0,
  posts_last_90d INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scores (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  github_score REAL DEFAULT 0,
  cp_score REAL DEFAULT 0,
  achievement_score REAL DEFAULT 0,
  project_score REAL DEFAULT 0,
  linkedin_score REAL DEFAULT 0,
  daily_score REAL DEFAULT 0,
  social_score REAL DEFAULT 0,
  total_score REAL DEFAULT 0,
  computed_at TEXT DEFAULT (datetime('now'))
);
