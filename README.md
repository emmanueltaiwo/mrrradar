# MRRRADAR

A map of profitable startups with verified MRR. Filter by country and revenue, explore on the globe. Data from [TrustMRR](https://trustmrr.com).

## How it works

- **Data:** Startups live in `data/startups.json`. A script fetches from the TrustMRR API and writes that file.
- **Sync:** GitHub Actions runs the script daily. You can also run it yourself (see below).
- **App:** Next.js serves the UI and a `GET /api/startups` route that reads the JSON and filters (name, country, MRR). The map shows up to 3000 startups; stats use the full count and total MRR.
- **Stack:** Next.js (App Router), TypeScript, Tailwind, Mapbox GL, TanStack Query, Motion.

## Run locally

1. **Env** – Create `.env.local`:
   - `TRUST_MRR_API_KEY` – your [TrustMRR](https://trustmrr.com) API key (for syncing).
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` – Mapbox token (for the map).

2. **Data** – Generate `data/startups.json` once:
   ```bash
   npm run sync-startups
   ```
   (Reads `TRUST_MRR_API_KEY` from `.env.local` if set.)

3. **Dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Sync (manual or cron)

- **Manual:** `npm run sync-startups`
- **Prod:** Add `TRUST_MRR_API_KEY` as a repo secret in GitHub (Settings → Secrets and variables → Actions). The workflow commits updated `data/startups.json` on a schedule and on manual run.

## Deploy

Build and run as a normal Next.js app. Ensure `data/startups.json` is present (e.g. committed after a sync or produced at build time). Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in your host’s env.
