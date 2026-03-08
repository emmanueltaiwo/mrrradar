import type { Metadata } from 'next';
import { Dashboard } from '@/components/Dashboard';
import { lookupStartup } from '@/lib/startup-lookup';
import { formatOgdollars } from '@/lib/og-styles';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mrrradar.com';

type Props = {
  params?: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let slug: string | undefined;
  try {
    const resolved = await params;
    slug = resolved?.slug?.[0];
  } catch {
    slug = undefined;
  }

  if (!slug) {
    return {
      title: 'MRRRADAR — Map of profitable startups with verified MRR',
      description:
        'Explore profitable startups on a global map. Filter by country and revenue, see verified MRR and growth. Built on TrustMRR data.',
    };
  }

  const startup = lookupStartup(slug);
  if (!startup) {
    return {
      title: 'MRRRADAR — Map of profitable startups with verified MRR',
    };
  }

  const mrr = formatOgdollars(startup.mrr ?? 0);
  const title = `${startup.name} — ${mrr} MRR | MRRRADAR`;
  const description =
    startup.description?.slice(0, 155) ??
    `${startup.name} on MRRRADAR. ${mrr} MRR${startup.country ? ` · ${startup.country}` : ''}. Profitable startups with verified revenue.`;
  const ogImageUrl = `${siteUrl}/api/og?slug=${encodeURIComponent(startup.slug)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${startup.slug}`,
      siteName: 'MRRRADAR',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${startup.name} — ${mrr} MRR on MRRRADAR`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function Page() {
  return <Dashboard />;
}
