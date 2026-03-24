import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Startup } from '@/types/startup';

const INVALID_COUNTRY_SENTINEL = '__INVALID_COUNTRY__';
const DEFAULT_LIMIT = 3000;

function matchesName(
  s: { name?: string },
  nameLower: string | undefined,
): boolean {
  if (!nameLower) return true;
  return (s.name ?? '').toLowerCase().includes(nameLower);
}

function filterStartups(
  startups: Startup[],
  params: { name?: string; country?: string; minMrr?: number; maxMrr?: number },
): { startups: Startup[]; totalCount: number; totalMrr: number } {
  if (params.country === INVALID_COUNTRY_SENTINEL) {
    return { startups: [], totalCount: 0, totalMrr: 0 };
  }

  const nameLower = params.name?.trim().toLowerCase();
  const country = params.country?.trim().toUpperCase();
  const minMrr = params.minMrr;
  const maxMrr = params.maxMrr;

  let candidates: Startup[];

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
  const filePath = path.join(process.cwd(), 'data', 'startups.json');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Startups data not available. Data sync may be in progress.' },
      { status: 503 },
    );
  }

  let data: { syncedAt: string; startups: Startup[] };
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(raw) as { syncedAt: string; startups: Startup[] };
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse startups data.' },
      { status: 500 },
    );
  }

  if (!Array.isArray(data.startups)) {
    return NextResponse.json(
      { error: 'Invalid startups data format.' },
      { status: 500 },
    );
  }

  const name = request.nextUrl.searchParams.get('name') ?? undefined;
  const country = request.nextUrl.searchParams.get('country') ?? undefined;
  const minMrrParam = request.nextUrl.searchParams.get('minMrr');
  const maxMrrParam = request.nextUrl.searchParams.get('maxMrr');
  const minMrr = minMrrParam != null ? Number(minMrrParam) : undefined;
  const maxMrr = maxMrrParam != null ? Number(maxMrrParam) : undefined;

  const { startups, totalCount, totalMrr } = filterStartups(data.startups, {
    name,
    country,
    minMrr: Number.isFinite(minMrr) ? minMrr : undefined,
    maxMrr: Number.isFinite(maxMrr) ? maxMrr : undefined,
  });

  return NextResponse.json(
    { startups, syncedAt: data.syncedAt, totalCount, totalMrr },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
