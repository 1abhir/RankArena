# Deploying RankArena

This gets you a real, public URL using free tiers. No credit card required
on either platform for this scale.

## 1. Push the code to GitHub
```bash
cd rankarena
git init && git add . && git commit -m "RankArena initial commit"
gh repo create rankarena --public --source=. --push
# or create a repo on github.com and: git remote add origin <url> && git push -u origin main
```

## 2. Backend → Render
1. Go to render.com → New → Web Service → connect your repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a **persistent disk** (Render dashboard → Disks): mount path `/opt/render/project/src/data`,
   and set `DB_PATH=/opt/render/project/src/data/rankarena.db` as an env var.
   (Without a disk, SQLite resets on every redeploy.)
6. Environment variables to add: `JWT_SECRET` (long random string),
   `CORS_ORIGIN` (your Vercel URL, added after step 3), `PORT` (Render sets this automatically).
7. Deploy. Note the resulting URL, e.g. `https://rankarena-api.onrender.com`.
8. Once deployed, open the Render Shell tab and run `npm run seed` once to add demo users.

## 3. Frontend → Vercel
1. Go to vercel.com → New Project → import the same repo.
2. Root directory: `frontend`
3. Framework preset: Vite (auto-detected).
4. Environment variable: `VITE_API_URL` = `https://rankarena-api.onrender.com/api`
5. Deploy. You'll get a URL like `https://rankarena.vercel.app`.

## 4. Close the loop
Go back to Render → set `CORS_ORIGIN` to your Vercel URL (e.g.
`https://rankarena.vercel.app`) → redeploy the backend so it accepts requests
from your live frontend.

## 5. (Optional) Swap SQLite for managed Postgres
For higher concurrency, create a free Postgres database on Render or Supabase,
then swap `better-sqlite3` for `pg` in `backend/src/db/init.js` — the rest of
the app (routes, scoring engine) is plain SQL and barely changes.

## Custom domain
Both Render and Vercel support adding a custom domain for free (just DNS
records) under their respective dashboards' "Domains" settings.
