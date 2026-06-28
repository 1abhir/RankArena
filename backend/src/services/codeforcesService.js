const axios = require('axios');

/**
 * Codeforces exposes a free, official, public API - no auth required.
 * Docs: https://codeforces.com/apiHelp
 */
async function fetchCodeforcesStats(handle) {
  const [infoRes, statusRes] = await Promise.all([
    axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
    axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`),
  ]);

  const info = infoRes.data.result[0];
  const submissions = statusRes.data.result;

  const solvedSet = new Set();
  submissions.forEach((s) => {
    if (s.verdict === 'OK') {
      solvedSet.add(`${s.problem.contestId}-${s.problem.index}`);
    }
  });

  return {
    handle,
    rating: info.rating || 0,
    max_rating: info.maxRating || 0,
    rank: info.rank || 'unrated',
    problems_solved: solvedSet.size,
    fetched_at: new Date().toISOString(),
  };
}

module.exports = { fetchCodeforcesStats };
