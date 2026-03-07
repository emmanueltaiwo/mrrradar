import type { Startup } from '@/types/startup';

export type StartupsFilterArgs = {
  name?: string;
  country?: string;
  minMrr?: number;
  maxMrr?: number;
};

export type StartupsResponse = {
  startups: Startup[];
  syncedAt: string;
};

export async function fetchStartups(
  args: StartupsFilterArgs
): Promise<StartupsResponse> {
  const params = new URLSearchParams();
  if (args.name) params.set('name', args.name);
  if (args.country) params.set('country', args.country);
  if (args.minMrr != null) params.set('minMrr', String(args.minMrr));
  if (args.maxMrr != null) params.set('maxMrr', String(args.maxMrr));
  const qs = params.toString();
  const res = await fetch(`/api/startups${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export const startupsQueryKey = (args: StartupsFilterArgs) =>
  ['startups', args] as const;
