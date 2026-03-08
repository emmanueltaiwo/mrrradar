import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { lookupStartup } from '@/lib/startup-lookup';
import {
  DefaultOgImage,
  StartupOgImage,
  OG_SIZE,
} from '@/lib/og-image-components';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim();

  if (!slug) {
    return new ImageResponse(<DefaultOgImage />, {
      ...OG_SIZE,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  const startup = lookupStartup(slug);
  if (!startup) {
    return new ImageResponse(<DefaultOgImage />, {
      ...OG_SIZE,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }

  return new ImageResponse(<StartupOgImage startup={startup} />, {
    ...OG_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
