import type { Metadata } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mrrradar.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MRRRADAR — Signal',
  description: 'Profitable startups. Verified. Live.',
  openGraph: {
    title: 'MRRRADAR — Signal',
    description: 'Profitable startups. Verified. Live.',
    url: siteUrl,
    siteName: 'MRRRADAR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MRRRADAR — Signal',
    description: 'Profitable startups. Verified. Live.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${orbitron.variable} ${jetbrains.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
