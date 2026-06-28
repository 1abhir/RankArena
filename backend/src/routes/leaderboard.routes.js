const express = require('express');
const db = require('../db/init');

const router = express.Router();

// GET /api/leaderboard?track=web-dev&role=student&limit=50
router.get('/', (req, res) => {
  const { track, role, limit } = req.query;
  const cap = Math.min(parseInt(limit, 10) || 50, 200);

  let query = `
    SELECT u.id, u.name, u.role, u.avatar_url, t.slug AS track_slug, t.name AS track_name,
           s.total_score, s.github_score, s.cp_score, s.achievement_score, s.project_score, s.linkedin_score, s.daily_score, s.social_score,
           (SELECT COUNT(DISTINCT log_date) FROM daily_logs dl WHERE dl.user_id = u.id AND dl.log_date >= date('now', '-6 days')) AS active_days_7d
    FROM users u
    JOIN scores s ON s.user_id = u.id
    LEFT JOIN tracks t ON t.id = u.primary_track_id
    WHERE 1=1
  `;
  const params = [];
  if (track) {
    query += ' AND t.slug = ?';
    params.push(track);
  }
  if (role) {
    query += ' AND u.role = ?';
    params.push(role);
  }
  query += ' ORDER BY s.total_score DESC LIMIT ?';
  params.push(cap);

  const rows = db.prepare(query).all(...params);
  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));
  res.json(ranked);
});

router.get('/tracks-summary', (req, res) => {
  const rows = db
    .prepare(
      `SELECT t.slug, t.name, COUNT(u.id) AS members, ROUND(AVG(s.total_score), 1) AS avg_score,
              MAX(s.total_score) AS top_score
       FROM tracks t
       LEFT JOIN users u ON u.primary_track_id = t.id
       LEFT JOIN scores s ON s.user_id = u.id
       GROUP BY t.id
       ORDER BY t.name`
    )
    .all();
  res.json(rows);
});

module.exports = router;
