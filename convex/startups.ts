import { v } from 'convex/values';
import { internalAction, internalMutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { getCoordsForCountry } from './countryCoords';

const TRUST_MRR_BASE = 'https://trustmrr.com/api/v1';
const LIMIT_PER_PAGE = 50;
const RATE_LIMIT_DELAY_MS = 4000;
const RATE_LIMIT_RETRY_AFTER_MS = 65000;

type TrustMRRStartup = {
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  website?: string | null;
  country?: string | null;
  foundedDate?: string | null;
  category?: string | null;
  paymentProvider?: string | null;
  targetAudience?: string | null;
  revenue: { last30Days: number; mrr: number; total?: number };
  customers: number;
  activeSubscriptions: number;
  askingPrice?: number | null;
  profitMarginLast30Days?: number | null;
  growth30d?: number | null;
  multiple?: number | null;
  onSale: boolean;
  firstListedForSaleAt?: string | null;
  xHandle?: string | null;
};

type ListResponse = {
  data: TrustMRRStartup[];
  meta: { total: number; page: number; limit: number; hasMore: boolean };
};

function normalizeStartup(item: TrustMRRStartup) {
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastSyncedAt: Date.now(),
  };
}

export const syncStartupsFromTrustMRR = internalAction({
  args: {},
  handler: async function (ctx) {
    const apiKey = process.env.TRUST_MRR_API_KEY;
    if (!apiKey) throw new Error('TRUST_MRR_API_KEY is not set');

    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    try {
      while (hasMore) {
        const url = `${TRUST_MRR_BASE}/startups?page=${page}&limit=${LIMIT_PER_PAGE}&sort=revenue-desc`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (res.status === 429) {
          const retryAfter =
            Number(res.headers.get('Retry-After')) * 1000 ||
            RATE_LIMIT_RETRY_AFTER_MS;
          await new Promise((r) => setTimeout(r, retryAfter));
          continue;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`TrustMRR API error ${res.status}: ${text}`);
        }

        const json = (await res.json()) as ListResponse;
        const batch = json.data.map(normalizeStartup);
        await ctx.runMutation(internal.startups.upsertStartups, {
          startups: batch,
        });

        totalSynced += batch.length;
        hasMore = json.meta.hasMore;
        page++;
        if (hasMore) {
          await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY_MS));
        }
      }

      return { synced: totalSynced };
    } catch (err) {
      throw err;
    }
  },
});

export const upsertStartups = internalMutation({
  args: {
    startups: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        website: v.optional(v.string()),
        logo: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        country: v.optional(v.string()),
        lat: v.number(),
        lng: v.number(),
        mrr: v.number(),
        revenueLast30Days: v.number(),
        revenueTotal: v.optional(v.number()),
        growthRate: v.optional(v.number()),
        customers: v.number(),
        activeSubscriptions: v.number(),
        askingPrice: v.optional(v.number()),
        onSale: v.boolean(),
        profitMarginLast30Days: v.optional(v.number()),
        multiple: v.optional(v.number()),
        firstListedForSaleAt: v.optional(v.string()),
        xHandle: v.optional(v.string()),
        paymentProvider: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
        foundedDate: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastSyncedAt: v.number(),
      }),
    ),
  },
  handler: async function (ctx, args) {
    const now = Date.now();

    for (const s of args.startups) {
      const existing = await ctx.db
        .query('startups')
        .withIndex('by_slug', (q) => q.eq('slug', s.slug))
        .unique();

      const doc = {
        ...s,
        updatedAt: now,
        lastSyncedAt: now,
      };

      if (!existing) {
        await ctx.db.insert('startups', { ...doc, createdAt: now });
      }
    }
  },
});

export const getStartups = query({
  args: {},
  handler: async function (ctx) {
    return await ctx.db.query('startups').collect();
  },
});

export const getStartupBySlug = query({
  args: { slug: v.string() },
  handler: async function (ctx, args) {
    return await ctx.db
      .query('startups')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

const INVALID_COUNTRY_SENTINEL = '__INVALID_COUNTRY__';
const DEFAULT_LIMIT = 3000;

function matchesName(s: { name?: string }, nameLower: string | undefined) {
  if (!nameLower) return true;
  return (s.name ?? '').toLowerCase().includes(nameLower);
}

export const filterStartups = query({
  args: {
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    minMrr: v.optional(v.number()),
    maxMrr: v.optional(v.number()),
  },
  handler: async function (ctx, args) {
    if (args.country === INVALID_COUNTRY_SENTINEL) return [];

    const nameLower = args.name?.trim().toLowerCase();
    const country = args.country?.trim().toUpperCase();
    const minMrr = args.minMrr;
    const maxMrr = args.maxMrr;

    type StartupDoc = Awaited<
      ReturnType<ReturnType<typeof ctx.db.query<'startups'>>['collect']>
    >[number];

    let candidates: StartupDoc[];

    if (country && (minMrr != null || maxMrr != null)) {
      const base = ctx.db
        .query('startups')
        .withIndex('by_country_mrr', (q) =>
          minMrr != null && maxMrr != null
            ? q.eq('country', country!).gte('mrr', minMrr).lte('mrr', maxMrr)
            : minMrr != null
              ? q.eq('country', country!).gte('mrr', minMrr)
              : q.eq('country', country!).lte('mrr', maxMrr!),
        );
      candidates = await base.collect();
    } else if (country) {
      candidates = await ctx.db
        .query('startups')
        .withIndex('by_country', (q) => q.eq('country', country))
        .collect();
    } else if (minMrr != null || maxMrr != null) {
      const base = ctx.db
        .query('startups')
        .withIndex('by_mrr', (q) =>
          minMrr != null && maxMrr != null
            ? q.gte('mrr', minMrr).lte('mrr', maxMrr)
            : minMrr != null
              ? q.gte('mrr', minMrr)
              : q.lte('mrr', maxMrr!),
        );
      candidates = await base.collect();
    } else {
      candidates = await ctx.db
        .query('startups')
        .withIndex('by_mrr', (q) => q.gte('mrr', 0))
        .order('desc')
        .take(DEFAULT_LIMIT);
    }

    if (!nameLower) return candidates;
    return candidates.filter((s) => matchesName(s, nameLower));
  },
});
