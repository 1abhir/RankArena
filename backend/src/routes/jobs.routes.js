const express = require('express');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT j.*, u.name AS poster_name
       FROM jobs j
       LEFT JOIN users u ON u.id = j.posted_by
       WHERE j.is_open = 1
       ORDER BY j.created_at DESC
       LIMIT 100`
    )
    .all();
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { title, company, location, job_type, domain, description, apply_url } = req.body;
  if (!title || !company) return res.status(400).json({ error: 'title and company are required' });
  const result = db
    .prepare(
      `INSERT INTO jobs (title, company, location, job_type, domain, description, apply_url, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title, company, location || '', job_type || 'Full-time', domain || '', description || '', apply_url || '', req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid));
});

module.exports = router;
