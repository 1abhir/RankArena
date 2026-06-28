# RankArena — Aggregated Ranking Engine for Notable Activity

A domain-specific leaderboard for students and professionals. RankArena scores
GitHub activity, competitive programming, shipped projects, achievements,
self-reported LinkedIn proof, public contributions, and daily work logs.

```
rankarena/
|-- backend/    Node.js + Express + SQLite API
`-- frontend/   React + Vite + Tailwind dashboard & leaderboard
```

<img width="2720" height="3280" alt="devboard_architecture" src="https://github.com/user-attachments/assets/4cdfd65b-7a1a-4653-ac78-58f87639d4ca" />

## Core Idea

Users create a profile, choose a domain track, connect public coding profiles,
log projects and achievements, and record daily work. RankArena turns that into
a transparent score and leaderboard for tracks like Web Development, AI/ML,
DSA & CP, Open Source, Mobile, Design, and Cloud/DevOps.

## Data Sources

| Platform | How data is fetched | Notes |
| --- | --- | --- |
| GitHub | Official REST API (`api.github.com`) | Public stats only. Optional PAT can raise rate limits. |
| Codeforces | Official public API (`codeforces.com/api`) | No auth needed. |
| LeetCode | Public GraphQL stats endpoint | Reads public solved-count stats. |
| LinkedIn | Self-reported only | Users enter follower, endorsement, recommendation, and post counts. |
| Daily work | User logged | Recent consistency contributes to score. |

## Scoring Formula

<img width="2720" height="2240" alt="devboard_scoring_model" src="https://github.com/user-attachments/assets/a9d9b12b-d7d8-4ba0-8069-7059a0ea5703" />


Each component is normalized 0-100 with a soft cap so one huge stat cannot
dominate. The total is a 0-1000 weighted blend:

```text
total = 1000 * (
  0.25 * GitHub +
  0.20 * Competitive +
  0.18 * Achievements +
  0.15 * Projects +
  0.10 * LinkedIn +
  0.12 * Daily Work
)
```

Tiers: Bronze (0-199), Silver (200-399), Gold (400-599), Platinum (600-799),
Diamond (800+).

The formula lives in `backend/src/services/scoringEngine.js`.

## Run Locally

Backend:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.
Frontend runs at `http://localhost:5173`.

Demo login after seeding: `aanya@example.com` / `password123`.
<img width="1467" height="722" alt="image" src="https://github.com/user-attachments/assets/95b8962e-f58f-4835-9d04-09b697775a6e" />
