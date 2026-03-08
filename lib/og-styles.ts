export const OG_SIZE = { width: 1200, height: 630 };

export function countryToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  return countryCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export function formatOgdollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatFoundedDate(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export const OG_COLORS = {
  bg: '#0a0c10',
  panel: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
  border: '#2a2e36',
  accent: '#f59e0b',
  accentGlow: 'rgba(245, 158, 11, 0.4)',
  live: '#22c55e',
  liveGlow: 'rgba(34, 197, 94, 0.5)',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  stripe:
    'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 8px, #0a0c10 8px, #0a0c10 16px)',
} as const;
