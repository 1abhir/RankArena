const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { recomputeScoreForUser, DAILY_CATEGORIES } = require('../services/scoringEngine');

const router = express.Router();

router.get('/categories', (req, res) => res.json(DAILY_CATEGORIES));

router.get('/me', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC LIMIT 30')
    .all(req.user.id);
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { title, category, minutes, impact, notes, track_id, log_date } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const normalizedCategory = category || 'learning';
  if (!DAILY_CATEGORIES.includes(normalizedCategory)) {
    return res.status(400).json({ error: `category must be one of: ${DAILY_CATEGORIES.join(', ')}` });
  }

  const normalizedImpact = Math.max(1, Math.min(5, Number(impact) || 1));
  const normalizedMinutes = Math.max(0, Number(minutes) || 0);
  const result = db
    .prepare(
      `INSERT INTO daily_logs (user_id, log_date, title, category, minutes, impact, notes, track_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      log_date || new Date().toISOString().slice(0, 10),
      title,
      normalizedCategory,
      normalizedMinutes,
      normalizedImpact,
      notes || '',
      track_id || null
    );

  recomputeScoreForUser(req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(req.params.id);
  if (!row || row.user_id !== req.user.id) return res.status(404).json({ error: 'Daily log not found' });
  db.prepare('DELETE FROM daily_logs WHERE id = ?').run(req.params.id);
  recomputeScoreForUser(req.user.id);
  res.status(204).end();
});

module.exports = router;
