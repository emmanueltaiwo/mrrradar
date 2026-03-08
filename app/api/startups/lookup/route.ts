import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type StartupDoc = {
  slug: string;
  name: string;
  website?: string;
  lat?: number;
  lng?: number;
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

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'startups.json');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Data not found' }, { status: 503 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as { startups: StartupDoc[] };
    const all = data?.startups;

    if (!Array.isArray(all)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 503 });
    }

    const qLower = q.toLowerCase();

    let found =
      all.find((s) => s.slug?.toLowerCase() === qLower) ??
      all.find(
        (s) =>
          domainFromWebsite(s.website).includes(qLower) ||
          domainFromWebsite(s.website) === qLower,
      );

    if (!found) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ startup: found });
  } catch (e) {
    console.error('[api/startups/lookup]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
