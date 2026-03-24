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
  totalCount: number;
  totalMrr: number;
};

type FetchError = {
  message: string;
  status: number;
  retryable: boolean;
};

function createError(message: string, status: number): FetchError {
  return {
    message,
    status,
    retryable: status >= 500 || status === 429,
  };
}

async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
): Promise<Response> {
  let lastError: FetchError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);

      if (res.ok) return res;

      const status = res.status;

      if (status === 503) {
        const data = await res.json().catch(() => ({}));
        throw createError(
          data.error || 'Service temporarily unavailable',
          status,
        );
      }

      if (status >= 400 && status < 500) {
        const data = await res.json().catch(() => ({}));
        throw createError(data.error || `Request failed (${status})`, status);
      }

      throw createError(`Server error (${status})`, status);
    } catch (err) {
      lastError =
        err instanceof Error
          ? createError(err.message, 0)
          : (err as FetchError);

      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || createError('Unknown error', 0);
}

export async function fetchStartups(
  args: StartupsFilterArgs,
): Promise<StartupsResponse> {
  const params = new URLSearchParams();

  if (args.name) params.set('name', args.name);
  if (args.country) params.set('country', args.country);
  if (args.minMrr != null) params.set('minMrr', String(args.minMrr));
  if (args.maxMrr != null) params.set('maxMrr', String(args.maxMrr));

  const qs = params.toString();
  const url = `/api/startups${qs ? `?${qs}` : ''}`;

  const res = await fetchWithRetry(url);

  return res.json();
}

export const startupsQueryKey = (args: StartupsFilterArgs) =>
  ['startups', args] as const;
