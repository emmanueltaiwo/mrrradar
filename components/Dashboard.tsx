'use client';

import { code } from 'country-emoji';
import { useState, useMemo, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoordsForCountry } from '@/lib/countryCoords';
import { RadarMap, type FlyToTarget } from '@/components/RadarMap';
import { StartupPanel } from '@/components/StartupPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { ActivityLog } from '@/components/ActivityLog';
import { useDebounce } from '@/hooks/useDebounce';
import {
  fetchStartups,
  startupsQueryKey,
  type StartupsFilterArgs,
} from '@/lib/startups-api';
import type { Startup } from '@/types/startup';

export type Filters = {
  name: string;
  country: string;
  minMrr: string;
  maxMrr: string;
};

const defaultFilters: Filters = {
  name: '',
  country: '',
  minMrr: '',
  maxMrr: '',
};

export const INVALID_COUNTRY_SENTINEL = '__INVALID_COUNTRY__';

const FILTER_DEBOUNCE_MS = 500;

export function Dashboard() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapDataReady, setMapDataReady] = useState(false);
  const debouncedFilters = useDebounce(filters, FILTER_DEBOUNCE_MS);

  const filterArgs = useMemo(() => {
    const minMrrRaw = debouncedFilters.minMrr.trim();
    const maxMrrRaw = debouncedFilters.maxMrr.trim();
    const minMrr = minMrrRaw ? parseInt(minMrrRaw, 10) : NaN;
    const maxMrr = maxMrrRaw ? parseInt(maxMrrRaw, 10) : NaN;
    const rawCountry = debouncedFilters.country.trim();
    let country: string | undefined = undefined;

    if (rawCountry) {
      if (rawCountry.length === 2) {
        country = rawCountry.toUpperCase();
      } else {
        const resolved = code(rawCountry);
        country = resolved ? resolved.toUpperCase() : INVALID_COUNTRY_SENTINEL;
      }
    }

    return {
      name: debouncedFilters.name.trim() || undefined,
      country: country || undefined,
      minMrr: Number.isFinite(minMrr) ? minMrr * 100 : undefined,
      maxMrr: Number.isFinite(maxMrr) ? maxMrr * 100 : undefined,
    };
  }, [debouncedFilters]) satisfies StartupsFilterArgs;

  const { data, isFetching, isPending } = useQuery({
    queryKey: startupsQueryKey(filterArgs),
    queryFn: () => fetchStartups(filterArgs),
    placeholderData: (previousData) => previousData,
  });

  const startupsRaw = data?.startups;
  const startups = useDeferredValue(startupsRaw ?? []);
  const selectedStartup =
    selectedSlug != null
      ? (startups.find((s) => s.slug === selectedSlug) ?? null)
      : null;

  const DEFAULT_MAP_VIEW: FlyToTarget = { center: [0, 20], zoom: 1.5 };

  const flyToTarget = useMemo((): FlyToTarget | null => {
    const hasFilter =
      debouncedFilters.name.trim() !== '' ||
      debouncedFilters.country.trim() !== '' ||
      debouncedFilters.minMrr.trim() !== '' ||
      debouncedFilters.maxMrr.trim() !== '';
    if (!hasFilter) return DEFAULT_MAP_VIEW;

    if (filterArgs.country && filterArgs.country !== INVALID_COUNTRY_SENTINEL) {
      const [lat, lng] = getCoordsForCountry(filterArgs.country);
      return { center: [lng, lat], zoom: 5 };
    }

    const withCoords = startups.filter(
      (s): s is (typeof startups)[0] & { lat: number; lng: number } =>
        s.lat != null && s.lng != null,
    );
    if (withCoords.length === 0) return null;

    const top = withCoords.reduce((a, b) =>
      (a.mrr ?? 0) >= (b.mrr ?? 0) ? a : b,
    );
    return { center: [top.lng, top.lat], zoom: 9 };
  }, [debouncedFilters, filterArgs.country, startups]);

  const isInitialLoad = !mapDataReady;
  const isFiltering = isInitialLoad && (isFetching || isPending);

  return (
    <div className='relative z-10 flex h-screen w-full max-w-[100vw] flex-col overflow-hidden'>
      {isInitialLoad && (
        <div
          className='absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background'
          aria-live='polite'
          aria-busy='true'
        >
          <div
            className='h-10 w-10 animate-spin rounded-full border-2 border-(--edge) border-t-transparent'
            role='status'
            aria-label='Loading'
          />
          <p className='font-mono text-sm uppercase tracking-wider text-(--text-dim)'>
            Loading MRRRADAR
          </p>
        </div>
      )}

      {isFiltering && (
        <div
          className='absolute inset-0 z-45 flex items-center justify-center'
          aria-live='polite'
          aria-busy='true'
        >
          <div
            className='absolute inset-0 bg-(--void)/60 backdrop-blur-[2px]'
            style={{ backdropFilter: 'blur(2px)' }}
          />
          <div
            className='relative flex flex-col items-center gap-4 px-4 py-6 sm:gap-6 sm:px-8 sm:py-10'
            style={{
              background:
                'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
              border: '2px solid #2a2e36',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 60px rgba(0,0,0,0.5)',
              clipPath:
                'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
            }}
          >
            <div
              className='absolute left-0 right-0 top-0 h-1.5'
              style={{
                background:
                  'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 6px, #0a0c10 6px, #0a0c10 12px)',
                borderBottom: '1px solid rgba(245,158,11,0.3)',
              }}
            />

            <div className='relative h-24 w-24'>
              <div
                className='absolute inset-0 rounded-full border-2'
                style={{ borderColor: 'rgba(245,158,11,0.25)' }}
              />
              <div
                className='absolute inset-0 animate-[spin_1.5s_linear_infinite] rounded-full'
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.5) 60deg, transparent 120deg)',
                  mask: 'radial-gradient(circle, transparent 60%, black 60%)',
                  WebkitMask:
                    'radial-gradient(circle, transparent 60%, black 60%)',
                }}
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <span
                  className='font-mono text-[10px] font-bold uppercase tracking-[0.3em]'
                  style={{ color: '#f59e0b' }}
                >
                  SEARCH
                </span>
              </div>
            </div>
            <div className='text-center'>
              <p
                className='font-mono text-[9px] font-bold uppercase tracking-[0.35em]'
                style={{ color: '#64748b' }}
              >
                ▸ FILTERING
              </p>
              <p
                className='mt-2 font-mono text-sm font-bold uppercase tracking-[0.2em]'
                style={{
                  color: '#f59e0b',
                  textShadow: '0 0 12px rgba(245,158,11,0.5)',
                }}
              >
                FILTERING STARTUPS
              </p>
              <p
                className='mt-1 font-mono text-[10px] uppercase tracking-wider'
                style={{ color: '#64748b' }}
              >
                Querying startups...
              </p>
            </div>
            <div className='flex flex-wrap justify-center gap-3 font-mono text-[9px]'>
              {debouncedFilters.name && (
                <span
                  className='rounded border px-2 py-1'
                  style={{
                    borderColor: '#374151',
                    background: 'rgba(42,46,54,0.8)',
                    color: '#f59e0b',
                  }}
                >
                  [ name: {debouncedFilters.name} ]
                </span>
              )}
              {debouncedFilters.country && (
                <span
                  className='rounded border px-2 py-1'
                  style={{
                    borderColor: '#374151',
                    background: 'rgba(42,46,54,0.8)',
                    color: '#f59e0b',
                  }}
                >
                  [ country: {debouncedFilters.country} ]
                </span>
              )}
              {debouncedFilters.minMrr && (
                <span
                  className='rounded border px-2 py-1'
                  style={{
                    borderColor: '#374151',
                    background: 'rgba(42,46,54,0.8)',
                    color: '#f59e0b',
                  }}
                >
                  [ min: ${debouncedFilters.minMrr} ]
                </span>
              )}
              {debouncedFilters.maxMrr && (
                <span
                  className='rounded border px-2 py-1'
                  style={{
                    borderColor: '#374151',
                    background: 'rgba(42,46,54,0.8)',
                    color: '#f59e0b',
                  }}
                >
                  [ max: ${debouncedFilters.maxMrr} ]
                </span>
              )}
              {!debouncedFilters.name &&
                !debouncedFilters.country &&
                !debouncedFilters.minMrr &&
                !debouncedFilters.maxMrr && (
                  <span style={{ color: '#64748b' }}>[ all startups ]</span>
                )}
            </div>
            <div
              className='h-1 w-32 overflow-hidden rounded-full'
              style={{ background: '#0f1216' }}
            >
              <div
                className='h-full animate-[shimmer_1.2s_ease-in-out_infinite]'
                style={{
                  width: '40%',
                  background:
                    'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                }}
              />
            </div>
            <div
              className='absolute right-3 top-10 h-1.5 w-1.5 rounded-full'
              style={{
                background: '#374151',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
            <div
              className='absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full'
              style={{
                background: '#374151',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
            <div
              className='absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full'
              style={{
                background: '#374151',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
          </div>
        </div>
      )}

      <header className='absolute left-0 right-0 top-0 z-30 flex items-center px-3 py-2 sm:px-4 sm:py-3'>
        <div
          className='relative flex flex-wrap items-center gap-2 sm:gap-4'
          style={{
            background:
              'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
            border: '2px solid #2a2e36',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.5)',
            padding: '8px 16px 8px 20px',
          }}
        >
          <div
            className='absolute left-0 top-0 bottom-0 w-1'
            style={{
              background:
                'repeating-linear-gradient(180deg, #f59e0b 0, #f59e0b 6px, #0a0c10 6px, #0a0c10 12px)',
            }}
          />
          <span
            className='font-mono text-[8px] font-bold uppercase tracking-[0.35em]'
            style={{ color: '#64748b' }}
          >
            ▸ DASHBOARD
          </span>
          <span
            className='font-bold tracking-[0.25em]'
            style={{
              color: '#f59e0b',
              textShadow: '0 0 12px rgba(245,158,11,0.5)',
            }}
          >
            MRRRADAR
          </span>
          <span className='flex items-center gap-2'>
            <span
              className='h-2 w-2 rounded-full'
              style={{
                background: '#22c55e',
                boxShadow:
                  '0 0 8px #22c55e, inset 0 0 2px rgba(255,255,255,0.5)',
              }}
            />
            <span
              className='font-mono text-[8px] font-bold uppercase tracking-[0.2em]'
              style={{ color: '#22c55e' }}
            >
              SYSTEMS ONLINE
            </span>
          </span>
          <div
            className='absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full'
            style={{
              background: '#374151',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </header>

      <main className='relative flex-1 overflow-hidden'>
        <RadarMap
          startups={startups}
          selectedSlug={selectedSlug}
          onSelectStartup={setSelectedSlug}
          onMapDataReady={() => setMapDataReady(true)}
          flyToTarget={flyToTarget}
        />

        <StatsPanel
          startups={startups}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <ActivityLog
          startups={startups}
          selectedSlug={selectedSlug}
          onSelectStartup={setSelectedSlug}
        />

        <StartupPanel
          startup={selectedStartup ?? null}
          onClose={() => setSelectedSlug(null)}
        />
      </main>
    </div>
  );
}
