/**
 * Startup shape from data/startups.json (and API). Used by Dashboard, StartupPanel, etc.
 */
export type Startup = {
  slug: string;
  name: string;
  website?: string;
  logo?: string;
  description?: string;
  category?: string;
  country?: string;
  lat?: number;
  lng?: number;
  mrr: number;
  revenueLast30Days: number;
  revenueTotal?: number;
  growthRate?: number;
  customers: number;
  activeSubscriptions: number;
  askingPrice?: number;
  onSale: boolean;
  profitMarginLast30Days?: number;
  multiple?: number;
  firstListedForSaleAt?: string;
  xHandle?: string;
  paymentProvider?: string;
  targetAudience?: string;
  foundedDate?: string;
  /** When this record was last synced (ms since epoch). From JSON sync. */
  lastSyncedAt?: number;
}
