const axios = require('axios');

/**
 * LeetCode has no official public REST API. This uses the same public
 * GraphQL endpoint LeetCode's own profile pages call client-side, and
 * only ever requests a user's already-public solved-count/ranking stats
 * (no auth, no private data). If LeetCode changes this endpoint, swap
 * this function to read from manual entry instead - the rest of the app
 * doesn't care where the numbers came from.
 */
async function fetchLeetcodeStats(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { ranking }
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;

  const res = await axios.post(
    'https://leetcode.com/graphql',
    { query, variables: { username } },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const user = res.data?.data?.matchedUser;
  if (!user) throw new Error('LeetCode user not found');

  const counts = {};
  user.submitStatsGlobal.acSubmissionNum.forEach((c) => {
    counts[c.difficulty.toLowerCase()] = c.count;
  });

  return {
    username,
    ranking: user.profile.ranking || null,
    total_solved: counts.all || 0,
    easy_solved: counts.easy || 0,
    medium_solved: counts.medium || 0,
    hard_solved: counts.hard || 0,
    fetched_at: new Date().toISOString(),
  };
}

module.exports = { fetchLeetcodeStats };
