/**
 * Format dollar amounts. TrustMRR data (mrr, revenueLast30Days, revenueTotal)
 * is stored in dollars - use as-is, do not divide by 100.
 */
export function formatDollars(amount: number): string {
  const val = amount;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
