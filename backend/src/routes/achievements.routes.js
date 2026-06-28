const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { recomputeScoreForUser, ACHIEVEMENT_POINTS } = require('../services/scoringEngine');

const router = express.Router();

router.get('/types', (req, res) => res.json(Object.keys(ACHIEVEMENT_POINTS)));

router.post('/', requireAuth, (req, res) => {
  const { title, type, issuer, achieved_on, proof_url, track_id } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'title and type are required' });
  if (!ACHIEVEMENT_POINTS[type]) {
    return res.status(400).json({ error: `type must be one of: ${Object.keys(ACHIEVEMENT_POINTS).join(', ')}` });
  }

  const result = db
    .prepare(
      `INSERT INTO achievements (user_id, title, type, issuer, achieved_on, proof_url, track_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, title, type, issuer || '', achieved_on || null, proof_url || '', track_id || null);

  recomputeScoreForUser(req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM achievements WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/:id', requireAuth, (req, res) => {
  const ach = db.prepare('SELECT * FROM achievements WHERE id = ?').get(req.params.id);
  if (!ach || ach.user_id !== req.user.id) return res.status(404).json({ error: 'Achievement not found' });
  db.prepare('DELETE FROM achievements WHERE id = ?').run(req.params.id);
  recomputeScoreForUser(req.user.id);
  res.status(204).end();
});

module.exports = router;
