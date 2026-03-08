import { ImageResponse } from 'next/og';
import { DefaultOgImage, OG_SIZE } from '@/lib/og-image-components';

export const alt = 'MRRRADAR — Profitable startups. Verified. Live.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(<DefaultOgImage />, { ...OG_SIZE });
}
