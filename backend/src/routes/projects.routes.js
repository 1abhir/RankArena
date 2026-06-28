const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { recomputeScoreForUser } = require('../services/scoringEngine');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  const { title, description, tech_stack, repo_url, live_url, track_id, stars } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const result = db
    .prepare(
      `INSERT INTO projects (user_id, title, description, tech_stack, repo_url, live_url, track_id, stars)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, title, description || '', tech_stack || '', repo_url || '', live_url || '', track_id || null, stars || 0);

  recomputeScoreForUser(req.user.id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

router.put('/:id', requireAuth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project || project.user_id !== req.user.id) return res.status(404).json({ error: 'Project not found' });

  const { title, description, tech_stack, repo_url, live_url, track_id, stars } = req.body;
  db.prepare(
    `UPDATE projects SET title=COALESCE(?,title), description=COALESCE(?,description),
     tech_stack=COALESCE(?,tech_stack), repo_url=COALESCE(?,repo_url), live_url=COALESCE(?,live_url),
     track_id=COALESCE(?,track_id), stars=COALESCE(?,stars) WHERE id = ?`
  ).run(title, description, tech_stack, repo_url, live_url, track_id, stars, req.params.id);

  recomputeScoreForUser(req.user.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project || project.user_id !== req.user.id) return res.status(404).json({ error: 'Project not found' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  recomputeScoreForUser(req.user.id);
  res.status(204).end();
});

module.exports = router;
