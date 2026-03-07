import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const INVALID_COUNTRY_SENTINEL = '__INVALID_COUNTRY__';
const DEFAULT_LIMIT = 3000;

type StartupDoc = {
  slug: string;
  name: string;
  country?: string;
  mrr: number;
  lat?: number;
  lng?: number;
  [key: string]: unknown;
};

function matchesName(
  s: { name?: string },
  nameLower: string | undefined,
): boolean {
  if (!nameLower) return true;
  return (s.name ?? '').toLowerCase().includes(nameLower);
}

function filterStartups(
  startups: StartupDoc[],
  params: { name?: string; country?: string; minMrr?: number; maxMrr?: number },
): { startups: StartupDoc[]; totalCount: number; totalMrr: number } {
  if (params.country === INVALID_COUNTRY_SENTINEL) {
    return { startups: [], totalCount: 0, totalMrr: 0 };
  }

  const nameLower = params.name?.trim().toLowerCase();
  const country = params.country?.trim().toUpperCase();
  const minMrr = params.minMrr;
  const maxMrr = params.maxMrr;

  let candidates: StartupDoc[];

  if (country !== undefined && country !== '') {
    candidates = startups.filter(
      (s) => (s.country ?? '').toUpperCase() === country,
    );
  } else {
    candidates = [...startups];
  }

  if (minMrr != null) {
    candidates = candidates.filter((s) => s.mrr >= minMrr);
  }
  if (maxMrr != null) {
    candidates = candidates.filter((s) => s.mrr <= maxMrr);
  }

  // Totals from full filtered set (before cap / name filter)
  const totalCount = candidates.length;
  const totalMrr = candidates.reduce((sum, s) => sum + (s.mrr ?? 0), 0);

  if (country === undefined || country === '') {
    candidates.sort((a, b) => b.mrr - a.mrr);
    candidates = candidates.slice(0, DEFAULT_LIMIT);
  }

  if (nameLower) {
    candidates = candidates.filter((s) => matchesName(s, nameLower));
  }

  return { startups: candidates, totalCount, totalMrr };
}

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'startups.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Startups data not found. Run sync or wait for cron.' },
        { status: 503 },
      );
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as {
      syncedAt: string;
      startups: StartupDoc[];
    };
    const { startups: allStartups, syncedAt } = data;
    if (!Array.isArray(allStartups)) {
      return NextResponse.json(
        { error: 'Invalid startups data' },
        { status: 503 },
      );
    }

    const name = request.nextUrl.searchParams.get('name') ?? undefined;
    const country = request.nextUrl.searchParams.get('country') ?? undefined;
    const minMrrParam = request.nextUrl.searchParams.get('minMrr');
    const maxMrrParam = request.nextUrl.searchParams.get('maxMrr');
    const minMrr = minMrrParam != null ? Number(minMrrParam) : undefined;
    const maxMrr = maxMrrParam != null ? Number(maxMrrParam) : undefined;

    const { startups, totalCount, totalMrr } = filterStartups(allStartups, {
      name,
      country,
      minMrr: Number.isFinite(minMrr) ? minMrr : undefined,
      maxMrr: Number.isFinite(maxMrr) ? maxMrr : undefined,
    });

    return NextResponse.json(
      { startups, syncedAt, totalCount, totalMrr },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (e) {
    console.error('[api/startups]', e);
    return NextResponse.json(
      { error: 'Failed to load startups' },
      { status: 500 },
    );
  }
}
