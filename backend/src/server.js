require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db/init'); // initializes & migrates the SQLite DB on boot

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const projectRoutes = require('./routes/projects.routes');
const achievementRoutes = require('./routes/achievements.routes');
const socialRoutes = require('./routes/social.routes');
const syncRoutes = require('./routes/sync.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const dailyRoutes = require('./routes/daily.routes');
const postsRoutes = require('./routes/posts.routes');
const jobsRoutes = require('./routes/jobs.routes');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'rankarena-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/jobs', jobsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RankArena API listening on port ${PORT}`));
