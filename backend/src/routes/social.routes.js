const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { recomputeScoreForUser } = require('../services/scoringEngine');

const router = express.Router();

// Link or update a github/codeforces/leetcode handle (does not sync yet - see sync.routes.js)
router.post('/link', requireAuth, (req, res) => {
  const { platform, handle, github_token } = req.body;
  const allowed = ['github', 'codeforces', 'leetcode'];
  if (!allowed.includes(platform)) {
    return res.status(400).json({ error: `platform must be one of: ${allowed.join(', ')}` });
  }
  if (!handle) return res.status(400).json({ error: 'handle is required' });

  db.prepare(
    `INSERT INTO social_profiles (user_id, platform, handle, github_token)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, platform) DO UPDATE SET handle = ?, github_token = ?`
  ).run(req.user.id, platform, handle, github_token || '', handle, github_token || '');

  res.json({ ok: true });
});

router.delete('/link/:platform', requireAuth, (req, res) => {
  db.prepare('DELETE FROM social_profiles WHERE user_id = ? AND platform = ?').run(req.user.id, req.params.platform);
  recomputeScoreForUser(req.user.id);
  res.status(204).end();
});

// LinkedIn is self-reported (no scraping/API access) - simple upsert of numbers the user provides
router.put('/linkedin', requireAuth, (req, res) => {
  const { followers, endorsements, recommendations, posts_last_90d } = req.body;
  db.prepare(
    `INSERT INTO linkedin_stats (user_id, followers, endorsements, recommendations, posts_last_90d, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET followers=?, endorsements=?, recommendations=?, posts_last_90d=?, updated_at=datetime('now')`
  ).run(
    req.user.id,
    followers || 0,
    endorsements || 0,
    recommendations || 0,
    posts_last_90d || 0,
    followers || 0,
    endorsements || 0,
    recommendations || 0,
    posts_last_90d || 0
  );
  recomputeScoreForUser(req.user.id);
  res.json(db.prepare('SELECT * FROM linkedin_stats WHERE user_id = ?').get(req.user.id));
});

module.exports = router;
