const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { recomputeScoreForUser } = require('../services/scoringEngine');

const router = express.Router();

const POST_POINTS = {
  update: 5,
  learning: 6,
  project: 12,
  achievement: 12,
  open_source: 14,
  hiring: 4,
};

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.*, u.name, u.headline, u.avatar_url, t.name AS track_name
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN tracks t ON t.id = u.primary_track_id
       ORDER BY p.created_at DESC
       LIMIT 50`
    )
    .all();
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { body, post_type, link_url } = req.body;
  if (!body) return res.status(400).json({ error: 'body is required' });
  const normalizedType = post_type || 'update';
  if (!POST_POINTS[normalizedType]) {
    return res.status(400).json({ error: `post_type must be one of: ${Object.keys(POST_POINTS).join(', ')}` });
  }

  const result = db
    .prepare('INSERT INTO posts (user_id, body, post_type, link_url, points) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, body, normalizedType, link_url || '', POST_POINTS[normalizedType]);
  recomputeScoreForUser(req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid));
});

module.exports = router;
