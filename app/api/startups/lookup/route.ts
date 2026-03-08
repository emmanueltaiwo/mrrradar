import { NextRequest, NextResponse } from 'next/server';
import { lookupStartup } from '@/lib/startup-lookup';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }

  try {
    const found = lookupStartup(q);
    if (!found) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ startup: found });
  } catch (e) {
    console.error('[api/startups/lookup]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
