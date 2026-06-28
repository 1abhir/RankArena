const db = require('../db/init');

/**
 * RankArena scoring formula
 * -------------------------
 * Every component is normalized to a 0-100 sub-score using a soft cap
 * (diminishing returns past a "strong" threshold, via log/sqrt curves)
 * so one outlier stat can't single-handedly dominate the leaderboard.
 * Sub-scores are then combined with fixed weights into a 0-1000 total.
 *
 *   total = 1000 * weighted blend of public work, proof, projects,
 *   LinkedIn presence, and recent daily consistency.
 */
const WEIGHTS = {
  github: 0.22,
  cp: 0.18,
  achievements: 0.16,
  projects: 0.15,
  linkedin: 0.09,
  daily: 0.12,
  social: 0.08,
};

const DAILY_CATEGORIES = ['learning', 'coding', 'open_source', 'project', 'interview_prep', 'content', 'other'];

const ACHIEVEMENT_POINTS = {
  hackathon_win: 100,
  award: 80,
  publication: 80,
  internship: 60,
  hackathon_participation: 30,
  certification: 40,
  other: 15,
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
// Soft-cap curve: fast climb early, flattens out near `cap`.
const softCap = (value, cap) => clamp01(Math.log(1 + Math.max(0, value)) / Math.log(1 + cap));

function scoreGithub(stats) {
  if (!stats) return 0;
  const repoScore = softCap(stats.public_repos, 40);
  const starScore = softCap(stats.total_stars, 200);
  const followerScore = softCap(stats.followers, 300);
  const langScore = softCap(stats.distinct_languages, 8);
  return clamp01(0.35 * repoScore + 0.35 * starScore + 0.2 * followerScore + 0.1 * langScore);
}

function scoreCompetitive(cf, lc) {
  const cfRating = cf ? softCap(Math.max(0, cf.rating), 2400) : 0;
  const cfSolved = cf ? softCap(cf.problems_solved, 800) : 0;
  const lcSolved = lc ? softCap(lc.total_solved, 1000) : 0;
  const lcHard = lc ? softCap(lc.hard_solved, 150) : 0;
  const parts = [cfRating, cfSolved, lcSolved, lcHard].filter((_, i) =>
    i < 2 ? !!cf : !!lc
  );
  if (!cf && !lc) return 0;
  const sub = 0.3 * cfRating + 0.25 * cfSolved + 0.25 * lcSolved + 0.2 * lcHard;
  return clamp01(sub);
}

function scoreAchievements(achievements) {
  if (!achievements.length) return 0;
  const totalPoints = achievements.reduce(
    (sum, a) => sum + (ACHIEVEMENT_POINTS[a.type] || ACHIEVEMENT_POINTS.other),
    0
  );
  return softCap(totalPoints, 400);
}

function scoreProjects(projects) {
  if (!projects.length) return 0;
  const countScore = softCap(projects.length, 12);
  const starsScore = softCap(projects.reduce((s, p) => s + (p.stars || 0), 0), 100);
  const stackSet = new Set(
    projects.flatMap((p) => (p.tech_stack || '').split(',').map((t) => t.trim()).filter(Boolean))
  );
  const diversityScore = softCap(stackSet.size, 10);
  return clamp01(0.5 * countScore + 0.3 * starsScore + 0.2 * diversityScore);
}

function scoreLinkedin(li) {
  if (!li) return 0;
  const followerScore = softCap(li.followers, 1000);
  const endorseScore = softCap(li.endorsements, 50);
  const recScore = softCap(li.recommendations, 15);
  const postScore = softCap(li.posts_last_90d, 20);
  return clamp01(0.35 * followerScore + 0.3 * endorseScore + 0.2 * recScore + 0.15 * postScore);
}

function scoreDaily(logs) {
  if (!logs.length) return 0;
  const activeDays = new Set(logs.map((log) => log.log_date)).size;
  const minutes = logs.reduce((sum, log) => sum + (log.minutes || 0), 0);
  const impact = logs.reduce((sum, log) => sum + (log.impact || 1), 0);
  const categories = new Set(logs.map((log) => log.category).filter(Boolean)).size;

  const consistencyScore = softCap(activeDays, 24);
  const timeScore = softCap(minutes, 2400);
  const impactScore = softCap(impact, 80);
  const diversityScore = softCap(categories, 5);
  return clamp01(0.4 * consistencyScore + 0.25 * timeScore + 0.25 * impactScore + 0.1 * diversityScore);
}

function scoreSocialPosts(posts) {
  if (!posts.length) return 0;
  const postPoints = posts.reduce((sum, post) => sum + (post.points || 0), 0);
  const activeDays = new Set(posts.map((post) => post.created_at.slice(0, 10))).size;
  const typeCount = new Set(posts.map((post) => post.post_type).filter(Boolean)).size;
  return clamp01(0.5 * softCap(postPoints, 120) + 0.3 * softCap(activeDays, 20) + 0.2 * softCap(typeCount, 5));
}

/**
 * Recomputes and persists the score for a single user, pulling their
 * latest synced social stats, achievements, and projects from the DB.
 */
function recomputeScoreForUser(userId) {
  const githubRow = db
    .prepare("SELECT raw_stats_json FROM social_profiles WHERE user_id = ? AND platform = 'github'")
    .get(userId);
  const cfRow = db
    .prepare("SELECT raw_stats_json FROM social_profiles WHERE user_id = ? AND platform = 'codeforces'")
    .get(userId);
  const lcRow = db
    .prepare("SELECT raw_stats_json FROM social_profiles WHERE user_id = ? AND platform = 'leetcode'")
    .get(userId);
  const liRow = db.prepare('SELECT * FROM linkedin_stats WHERE user_id = ?').get(userId);
  const achievements = db.prepare('SELECT * FROM achievements WHERE user_id = ?').all(userId);
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ?').all(userId);
  const dailyLogs = db
    .prepare("SELECT * FROM daily_logs WHERE user_id = ? AND log_date >= date('now', '-29 days')")
    .all(userId);
  const posts = db
    .prepare("SELECT * FROM posts WHERE user_id = ? AND created_at >= datetime('now', '-29 days')")
    .all(userId);

  const githubStats = githubRow ? JSON.parse(githubRow.raw_stats_json) : null;
  const cfStats = cfRow ? JSON.parse(cfRow.raw_stats_json) : null;
  const lcStats = lcRow ? JSON.parse(lcRow.raw_stats_json) : null;

  const githubScore = scoreGithub(githubStats);
  const cpScore = scoreCompetitive(cfStats, lcStats);
  const achievementScore = scoreAchievements(achievements);
  const projectScore = scoreProjects(projects);
  const linkedinScore = scoreLinkedin(liRow);
  const dailyScore = scoreDaily(dailyLogs);
  const socialScore = scoreSocialPosts(posts);

  const total =
    1000 *
    (WEIGHTS.github * githubScore +
      WEIGHTS.cp * cpScore +
      WEIGHTS.achievements * achievementScore +
      WEIGHTS.projects * projectScore +
      WEIGHTS.linkedin * linkedinScore +
      WEIGHTS.daily * dailyScore +
      WEIGHTS.social * socialScore);

  db.prepare(
    `INSERT INTO scores (user_id, github_score, cp_score, achievement_score, project_score, linkedin_score, daily_score, social_score, total_score, computed_at)
     VALUES (@user_id, @github_score, @cp_score, @achievement_score, @project_score, @linkedin_score, @daily_score, @social_score, @total_score, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       github_score=@github_score, cp_score=@cp_score, achievement_score=@achievement_score,
       project_score=@project_score, linkedin_score=@linkedin_score, daily_score=@daily_score, social_score=@social_score, total_score=@total_score,
       computed_at=datetime('now')`
  ).run({
    user_id: userId,
    github_score: Math.round(githubScore * 1000) / 10,
    cp_score: Math.round(cpScore * 1000) / 10,
    achievement_score: Math.round(achievementScore * 1000) / 10,
    project_score: Math.round(projectScore * 1000) / 10,
    linkedin_score: Math.round(linkedinScore * 1000) / 10,
    daily_score: Math.round(dailyScore * 1000) / 10,
    social_score: Math.round(socialScore * 1000) / 10,
    total_score: Math.round(total * 10) / 10,
  });

  return db.prepare('SELECT * FROM scores WHERE user_id = ?').get(userId);
}

module.exports = { recomputeScoreForUser, WEIGHTS, ACHIEVEMENT_POINTS, DAILY_CATEGORIES };
