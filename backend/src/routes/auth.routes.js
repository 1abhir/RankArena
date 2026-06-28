const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/init');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role, primary_track_id } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const password_hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare(
      'INSERT INTO users (name, email, password_hash, role, primary_track_id) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, email, password_hash, role || 'student', primary_track_id || null);

  const user = db.prepare('SELECT id, name, email, role, primary_track_id FROM users WHERE id = ?').get(
    result.lastInsertRowid
  );
  const token = signToken(user);
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = signToken(user);
  delete user.password_hash;
  res.json({ user, token });
});

module.exports = router;
