# MRRRADAR

Sci-fi startup radar map: visualize profitable startups worldwide using real data from the [TrustMRR API](https://trustmrr.com/docs/api).

## Stack

- Next.js (App Router), TypeScript, TailwindCSS
- Mapbox GL JS, Convex, Framer Motion (motion)

## Setup

1. **Environment (`.env.local`)**

   - `NEXT_PUBLIC_CONVEX_URL` — from Convex dashboard (or `npx convex dev`)
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — Mapbox public token (starts with `pk.`); must be prefixed with `NEXT_PUBLIC_` so the client can load the map

2. **Convex**

   - Run `npx convex dev` and set the TrustMRR API key for the backend:
     ```bash
     npx convex env set TRUST_MRR_API_KEY "tmrr_your_api_key"
     ```

3. **Sync data**

   - In the app, click **Sync** in the header to fetch startups from TrustMRR into Convex (rate-limited; run once or periodically).

4. **Run the app**

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The map shows startups as radar dots (size = MRR, color = growth). Use filters and click a dot to open the detail panel.
