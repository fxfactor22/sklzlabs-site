# SKLZ Labs — Website

Landing page for sklzlabs.com. Static HTML + a tiny Python static server for Railway.

## Structure
- `index.html` — the landing page (self-contained: CSS + JS inline)
- `sklz-logo.png` — brand logo (transparent)
- `server.py` — minimal static server (reads `PORT` from env)
- `railway.json` / `nixpacks.toml` — Railway deploy config

## Local preview
Open `index.html` in a browser, or:
    python server.py    # then visit http://localhost:8080

## Deploy (GitHub → Railway)
1. Push this folder to a GitHub repo.
2. In Railway: New Project → Deploy from GitHub repo → pick this repo.
3. Railway auto-detects `railway.json`, builds, and gives a public URL.
4. Add custom domain `sklzlabs.com` in Railway → Settings → Networking.
5. In GoDaddy DNS, add the CNAME Railway shows you.

## Next (backend)
Waitlist + affiliate + accounts run on Supabase (auth + Postgres) and the
FastAPI backend. The `joinWait()` stub in index.html POSTs to `/api/waitlist`
once that endpoint exists.
