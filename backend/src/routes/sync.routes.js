const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { fetchGithubStats } = require('../services/githubService');
const { fetchCodeforcesStats } = require('../services/codeforcesService');
const { fetchLeetcodeStats } = require('../services/leetcodeService');
const { recomputeScoreForUser } = require('../services/scoringEngine');

const router = express.Router();

const FETCHERS = {
  github: (row) => fetchGithubStats(row.handle, row.github_token),
  codeforces: (row) => fetchCodeforcesStats(row.handle),
  leetcode: (row) => fetchLeetcodeStats(row.handle),
};

// Sync a single platform for the logged-in user
router.post('/:platform', requireAuth, async (req, res) => {
  const { platform } = req.params;
  if (!FETCHERS[platform]) return res.status(400).json({ error: 'Unsupported platform' });

  const row = db
    .prepare('SELECT * FROM social_profiles WHERE user_id = ? AND platform = ?')
    .get(req.user.id, platform);
  if (!row) return res.status(404).json({ error: `No ${platform} handle linked yet` });

  try {
    const stats = await FETCHERS[platform](row);
    db.prepare(
      "UPDATE social_profiles SET raw_stats_json = ?, last_synced_at = datetime('now') WHERE id = ?"
    ).run(JSON.stringify(stats), row.id);
    const score = recomputeScoreForUser(req.user.id);
    res.json({ platform, stats, score });
  } catch (err) {
    res.status(502).json({ error: `Failed to sync ${platform}: ${err.message}` });
  }
});

// Sync every linked platform at once
router.post('/', requireAuth, async (req, res) => {
  const rows = db.prepare('SELECT * FROM social_profiles WHERE user_id = ?').all(req.user.id);
  const results = {};
  for (const row of rows) {
    if (!FETCHERS[row.platform]) continue;
    try {
      const stats = await FETCHERS[row.platform](row);
      db.prepare(
        "UPDATE social_profiles SET raw_stats_json = ?, last_synced_at = datetime('now') WHERE id = ?"
      ).run(JSON.stringify(stats), row.id);
      results[row.platform] = { ok: true, stats };
    } catch (err) {
      results[row.platform] = { ok: false, error: err.message };
    }
  }
  const score = recomputeScoreForUser(req.user.id);
  res.json({ results, score });
});

module.exports = router;
