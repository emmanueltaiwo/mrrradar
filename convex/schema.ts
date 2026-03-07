import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  startups: defineTable({
    slug: v.string(),
    name: v.string(),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    country: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
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
  })
    .index('by_slug', ['slug'])
    .index('by_country', ['country'])
    .index('by_country_mrr', ['country', 'mrr'])
    .index('by_category', ['category'])
    .index('by_mrr', ['mrr'])
    .index('by_growth', ['growthRate'])
    .index('by_last_synced', ['lastSyncedAt']),
});
