/**
 * Fetches all startups from TrustMRR API and writes data/startups.json.
 * Run: npm run sync-startups (loads TRUST_MRR_API_KEY from .env.local if present)
 * Or: TRUST_MRR_API_KEY=xxx npm run sync-startups
 * Used by GitHub Actions cron (daily).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'data', 'startups.json');

// Load .env.local so `npm run sync-startups` works without exporting vars
if (!process.env.TRUST_MRR_API_KEY) {
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        )
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

const TRUST_MRR_BASE = 'https://trustmrr.com/api/v1';
const LIMIT_PER_PAGE = 50;
const RATE_LIMIT_DELAY_MS = 4000;
const RATE_LIMIT_RETRY_AFTER_MS = 65000;

const COORDS = {
  ad: [42.5, 1.5],
  ae: [24, 54],
  af: [33, 65],
  ag: [17.05, -61.8],
  ai: [18.25, -63.17],
  al: [41, 20],
  am: [40, 45],
  ao: [-12.5, 18.5],
  ar: [-34, -64],
  as: [-14.33, -170],
  at: [47.33, 13.33],
  au: [-27, 133],
  aw: [12.5, -69.97],
  az: [40.5, 47.5],
  ba: [44, 18],
  bb: [13.17, -59.53],
  bd: [24, 90],
  be: [50.83, 4],
  bf: [13, -2],
  bg: [43, 25],
  bh: [26, 50.55],
  bi: [-3.5, 30],
  bj: [9.5, 2.25],
  bm: [32.33, -64.75],
  bn: [4.5, 114.67],
  bo: [-17, -65],
  br: [-10, -55],
  bs: [24.25, -76],
  bt: [27.5, 90.5],
  bw: [-22, 24],
  by: [53, 28],
  bz: [17.25, -88.75],
  ca: [60, -95],
  cd: [0, 25],
  cf: [7, 21],
  cg: [-1, 15],
  ch: [47, 8],
  ci: [8, -5],
  cl: [-30, -71],
  cm: [6, 12],
  cn: [35, 105],
  co: [4, -72],
  cr: [10, -84],
  cu: [21.5, -80],
  cv: [16, -24],
  cy: [35, 33],
  cz: [49.75, 15.5],
  de: [51, 9],
  dj: [11.5, 43],
  dk: [56, 10],
  do: [19, -70.67],
  dz: [28, 3],
  ec: [-2, -77.5],
  ee: [59, 26],
  eg: [27, 30],
  er: [15, 39],
  es: [40, -4],
  et: [8, 38],
  fi: [64, 26],
  fj: [-18, 175],
  fr: [46, 2],
  ga: [-1, 11.75],
  gb: [54, -2],
  gd: [12.12, -61.67],
  ge: [42, 43.5],
  gh: [8, -2],
  gr: [39, 22],
  gt: [15.5, -90.25],
  hk: [22.25, 114.17],
  hn: [15, -86.5],
  hr: [45.17, 15.5],
  ht: [19, -72.42],
  hu: [47, 20],
  id: [-5, 120],
  ie: [53, -8],
  il: [31.5, 34.75],
  in: [20, 77],
  iq: [33, 44],
  ir: [32, 53],
  is: [65, -18],
  it: [42.83, 12.83],
  jm: [18.25, -77.5],
  jo: [31, 36],
  jp: [36, 138],
  ke: [1, 38],
  kg: [41, 75],
  kh: [13, 105],
  kr: [37, 127.5],
  kw: [29.34, 47.66],
  kz: [48, 68],
  la: [18, 105],
  lb: [33.83, 35.83],
  lk: [7, 81],
  lr: [6.5, -9.5],
  ls: [-29.5, 28.5],
  lt: [56, 24],
  lu: [49.75, 6.17],
  lv: [57, 25],
  ly: [25, 17],
  ma: [32, -5],
  mc: [43.73, 7.4],
  md: [47, 29],
  me: [42, 19],
  mg: [-20, 47],
  mx: [23, -102],
  my: [2.5, 112.5],
  mz: [-18.25, 35],
  na: [-22, 17],
  ne: [16, 8],
  ng: [10, 8],
  ni: [13, -85],
  nl: [52.5, 5.75],
  no: [62, 10],
  np: [28, 84],
  nz: [-41, 174],
  om: [21, 57],
  pa: [9, -80],
  pe: [-10, -76],
  ph: [13, 122],
  pk: [30, 70],
  pl: [52, 20],
  pr: [18.25, -66.5],
  pt: [39.5, -8],
  py: [-23, -58],
  qa: [25.5, 51.25],
  ro: [46, 25],
  rs: [44, 21],
  ru: [60, 100],
  rw: [-2, 30],
  sa: [25, 45],
  se: [62, 15],
  sg: [1.37, 103.8],
  si: [46, 15],
  sk: [48.67, 19.5],
  sn: [14, -14],
  sv: [13.83, -88.92],
  sy: [35, 38],
  th: [15, 100],
  tn: [34, 9],
  tr: [39, 35],
  tt: [11, -61],
  tw: [23.5, 121],
  tz: [-6, 35],
  ua: [49, 32],
  ug: [1, 32],
  us: [38, -97],
  uy: [-33, -56],
  uz: [41, 64],
  ve: [8, -66],
  vn: [16, 106],
  za: [-29, 24],
  zm: [-15, 30],
  zw: [-20, 30],
};
const FALLBACK = [20, 0];

function getCoordsForCountry(countryCode) {
  if (!countryCode) return FALLBACK;
  const key = String(countryCode).toLowerCase();
  return COORDS[key] ?? FALLBACK;
}

function normalizeStartup(item, now) {
  const [lat, lng] = getCoordsForCountry(item.country);
  return {
    slug: item.slug,
    name: item.name,
    website: item.website ?? undefined,
    logo: item.icon ?? undefined,
    description: item.description ?? undefined,
    category: item.category ?? undefined,
    country: item.country ?? undefined,
    lat,
    lng,
    mrr: item.revenue.mrr,
    revenueLast30Days: item.revenue.last30Days,
    revenueTotal: item.revenue.total,
    growthRate: item.growth30d ?? undefined,
    customers: item.customers,
    activeSubscriptions: item.activeSubscriptions,
    askingPrice: item.askingPrice ?? undefined,
    onSale: item.onSale,
    profitMarginLast30Days: item.profitMarginLast30Days ?? undefined,
    multiple: item.multiple ?? undefined,
    firstListedForSaleAt: item.firstListedForSaleAt ?? undefined,
    xHandle: item.xHandle ?? undefined,
    paymentProvider: item.paymentProvider ?? undefined,
    targetAudience: item.targetAudience ?? undefined,
    foundedDate: item.foundedDate ?? undefined,
    lastSyncedAt: now,
  };
}

async function run() {
  const startTime = Date.now();
  const startIso = new Date(startTime).toISOString();
  console.log(`Sync started at ${startIso}`);

  const apiKey = process.env.TRUST_MRR_API_KEY;
  if (!apiKey) {
    throw new Error('TRUST_MRR_API_KEY is not set');
  }

  const allStartups = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${TRUST_MRR_BASE}/startups?page=${page}&limit=${LIMIT_PER_PAGE}&sort=revenue-desc`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.status === 429) {
      const retryAfter =
        Number(res.headers.get('Retry-After')) * 1000 ||
        RATE_LIMIT_RETRY_AFTER_MS;
      console.log(`Rate limited; waiting ${retryAfter / 1000}s...`);
      await new Promise((r) => setTimeout(r, retryAfter));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TrustMRR API error ${res.status}: ${text}`);
    }

    const json = await res.json();
    const now = Date.now();
    const batch = json.data.map((item) => normalizeStartup(item, now));
    allStartups.push(...batch);
    hasMore = json.meta?.hasMore ?? false;
    console.log(
      `Page ${page}: ${batch.length} startups (total ${allStartups.length})`,
    );
    page++;
    if (hasMore) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY_MS));
    }
  }

  const dataDir = path.join(ROOT, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const output = {
    syncedAt: new Date().toISOString(),
    startups: allStartups,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output), 'utf8');
  const endTime = Date.now();
  const endIso = new Date(endTime).toISOString();
  const durationMs = endTime - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);
  console.log(`Wrote ${allStartups.length} startups to ${OUT_PATH}`);
  console.log(
    `Sync finished at ${endIso} (started ${startIso}, duration ${durationSec}s)`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
