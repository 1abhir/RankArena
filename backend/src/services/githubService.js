const axios = require('axios');

/**
 * Fetches public profile + repo stats from the official GitHub REST API.
 * If the user supplied their own personal access token, it's used to avoid
 * the 60 req/hr unauthenticated rate limit. Otherwise falls back to an
 * optional server-side token, then to unauthenticated requests.
 */
async function fetchGithubStats(username, userToken) {
  const token = userToken || process.env.GITHUB_FALLBACK_TOKEN || '';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const profileRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
  const profile = profileRes.data;

  const reposRes = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );
  const repos = reposRes.data;

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const languages = new Set(repos.map((r) => r.language).filter(Boolean));

  return {
    username,
    public_repos: profile.public_repos || 0,
    followers: profile.followers || 0,
    total_stars: totalStars,
    total_forks: totalForks,
    distinct_languages: languages.size,
    avatar_url: profile.avatar_url,
    fetched_at: new Date().toISOString(),
  };
}

module.exports = { fetchGithubStats };
