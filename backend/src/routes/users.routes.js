const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/tracks', (req, res) => {
  res.json(db.prepare('SELECT * FROM tracks ORDER BY name').all());
});

router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, primary_track_id, headline, degree, institution, location, bio, avatar_url, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  const social = db.prepare('SELECT platform, handle, last_synced_at FROM social_profiles WHERE user_id = ?').all(
    req.user.id
  );
  const score = db.prepare('SELECT * FROM scores WHERE user_id = ?').get(req.user.id);
  const daily = db
    .prepare('SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC LIMIT 7')
    .all(req.user.id);
  res.json({ user, social, score: score || null, daily });
});

router.put('/me', requireAuth, (req, res) => {
  const { name, headline, degree, institution, location, bio, avatar_url, role, primary_track_id } = req.body;
  db.prepare(
    `UPDATE users SET name = COALESCE(?, name), headline = COALESCE(?, headline), degree = COALESCE(?, degree),
     institution = COALESCE(?, institution), location = COALESCE(?, location), bio = COALESCE(?, bio),
     avatar_url = COALESCE(?, avatar_url), role = COALESCE(?, role), primary_track_id = COALESCE(?, primary_track_id)
     WHERE id = ?`
  ).run(name, headline, degree, institution, location, bio, avatar_url, role, primary_track_id, req.user.id);
  const user = db
    .prepare('SELECT id, name, email, role, primary_track_id, headline, degree, institution, location, bio, avatar_url FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
});

router.get('/:id', (req, res) => {
  const user = db
    .prepare('SELECT id, name, role, primary_track_id, headline, degree, institution, location, bio, avatar_url, created_at FROM users WHERE id = ?')
    .get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const social = db
    .prepare('SELECT platform, handle, raw_stats_json, last_synced_at FROM social_profiles WHERE user_id = ?')
    .all(req.params.id);
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  const achievements = db
    .prepare('SELECT * FROM achievements WHERE user_id = ? ORDER BY achieved_on DESC')
    .all(req.params.id);
  const score = db.prepare('SELECT * FROM scores WHERE user_id = ?').get(req.params.id);
  const daily = db
    .prepare('SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC LIMIT 14')
    .all(req.params.id);
  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id);
  res.json({ user, social, projects, achievements, daily, posts, score: score || null });
});

module.exports = router;
