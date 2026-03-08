import fs from 'fs';
import path from 'path';

export type StartupDoc = {
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
  revenueLast30Days?: number;
  revenueTotal?: number;
  growthRate?: number;
  customers?: number;
  activeSubscriptions?: number;
  xHandle?: string;
  foundedDate?: string;
  [key: string]: unknown;
};

function domainFromWebsite(website: string | undefined): string {
  if (!website?.trim()) return '';
  try {
    const u = new URL(
      website.startsWith('http') ? website : `https://${website}`,
    );
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return website.toLowerCase();
  }
}

export function lookupStartup(q: string): StartupDoc | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'startups.json');
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as { startups: StartupDoc[] };
    const all = data?.startups;

    if (!Array.isArray(all)) return null;

    const qLower = q.toLowerCase();
    const found =
      all.find((s) => s.slug?.toLowerCase() === qLower) ??
      all.find(
        (s) =>
          domainFromWebsite(s.website).includes(qLower) ||
          domainFromWebsite(s.website) === qLower,
      );

    return found ?? null;
  } catch {
    return null;
  }
}
