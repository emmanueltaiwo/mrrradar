import fs from 'fs';
import path from 'path';
import type { Startup } from '@/types/startup';

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

export function lookupStartup(q: string): Startup | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'startups.json');
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as { startups: Startup[] };
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
