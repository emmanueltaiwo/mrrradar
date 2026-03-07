'use client';

import { flag, name as countryName } from 'country-emoji';
import { useState, useRef } from 'react';
import { FiltersBar } from '@/components/FiltersBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Filters } from '@/components/Dashboard';
import type { Startup } from '@/types/startup';

type Props = {
  startups: Startup[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
};

function formatEstValue(cents: number) {
  const val = cents / 100;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export function StatsPanel({ startups, filters, onFiltersChange }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const totalMrr = startups.reduce((sum, s) => sum + (s.mrr ?? 0), 0);
  const estValue = totalMrr * 36;

  const byCountry = startups.reduce<Record<string, number>>((acc, s) => {
    const c = s.country ?? 'Unknown';
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(byCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const byCategory = startups.reduce<Record<string, number>>((acc, s) => {
    const c = s.category ?? 'Other';
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  if (isMobile) {
    return (
      <>
        {!expanded ? (
          <button
            type='button'
            onClick={() => setExpanded(true)}
            className='absolute left-2 top-13 z-20 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 touch-manipulation'
            style={{
              background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
              border: '1px solid #2a2e36',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
            aria-label='Open stats and filters'
          >
            <span
              className='h-1.5 w-1.5 rounded-full'
              style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
            />
            <span
              className='font-mono text-[10px] font-bold tabular-nums'
              style={{ color: '#f59e0b' }}
            >
              {startups.length}
            </span>
            <span className='font-mono text-[9px]' style={{ color: '#64748b' }}>
              ·
            </span>
            <span
              className='font-mono text-[10px] font-bold tabular-nums'
              style={{ color: '#22c55e' }}
            >
              {formatEstValue(estValue)}
            </span>
          </button>
        ) : (
          <div
            className='fixed inset-0 z-50 flex items-end justify-center sm:hidden'
            aria-modal
          >
            <div
              className='absolute inset-0 bg-black/50'
              onClick={() => setExpanded(false)}
              aria-hidden
            />
            <div
              className='relative z-10 max-h-[38vh] w-full max-w-[340px] overflow-y-auto rounded-t-2xl'
              style={{
                background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
                border: '2px solid #2a2e36',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
              }}
            >
              <div
                className='sticky top-0 flex items-center justify-between border-b px-4 py-3'
                style={{ borderColor: '#2a2e36', background: '#1a1d24' }}
              >
                <span
                  className='font-mono text-[10px] font-bold uppercase tracking-wider'
                  style={{ color: '#94a3b8' }}
                >
                  ▸ STATUS
                </span>
                <button
                  type='button'
                  onClick={() => setExpanded(false)}
                  className='font-mono text-[10px]'
                  style={{ color: '#64748b' }}
                >
                  Close
                </button>
              </div>
              <div className='p-4'>
                <div className='mb-4 flex gap-3'>
                  <div
                    className='flex-1 rounded p-3 text-center'
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid #2a2e36',
                    }}
                  >
                    <p
                      className='font-mono text-[8px] uppercase'
                      style={{ color: '#64748b' }}
                    >
                      Tracked
                    </p>
                    <p
                      className='font-mono text-xl font-bold tabular-nums'
                      style={{ color: '#f59e0b' }}
                    >
                      {startups.length}
                    </p>
                  </div>
                  <div
                    className='flex-1 rounded p-3 text-center'
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid #2a2e36',
                    }}
                  >
                    <p
                      className='font-mono text-[8px] uppercase'
                      style={{ color: '#64748b' }}
                    >
                      Est. value
                    </p>
                    <p
                      className='font-mono text-lg font-bold tabular-nums'
                      style={{ color: '#22c55e' }}
                    >
                      {formatEstValue(estValue)}
                    </p>
                  </div>
                </div>
                <div
                  className='border-t pt-3'
                  style={{ borderColor: '#2a2e36' }}
                >
                  <button
                    type='button'
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className='flex w-full items-center justify-between rounded px-3 py-2.5 font-mono text-[10px] uppercase'
                    style={{
                      background: filtersOpen
                        ? 'rgba(245,158,11,0.08)'
                        : 'rgba(42,46,54,0.6)',
                      border: '1px solid #374151',
                      color: filtersOpen ? '#f59e0b' : '#94a3b8',
                    }}
                  >
                    <span>▸ SEARCH</span>
                    <span className='text-[8px]' style={{ color: '#64748b' }}>
                      {filtersOpen ? '[ ACTIVE ]' : '[ STANDBY ]'}
                    </span>
                  </button>
                  {filtersOpen && (
                    <div
                      className='mt-3 rounded p-3'
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid #2a2e36',
                      }}
                    >
                      <FiltersBar
                        filters={filters}
                        onFiltersChange={onFiltersChange}
                        variant='dark'
                        compact
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className='absolute left-4 top-18 z-20 hidden w-[min(380px,calc(100vw-2rem))] sm:block'>
      <div
        className='relative overflow-hidden'
        style={{
          background:
            'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
          border: '2px solid #2a2e36',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.04),
            inset 0 -1px 0 rgba(0,0,0,0.5),
            0 0 0 1px #1a1d24,
            0 20px 40px -10px rgba(0,0,0,0.6)
          `,
        }}
      >
        <div
          className='h-1.5 w-full'
          style={{
            background:
              'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 8px, #0a0c10 8px, #0a0c10 16px)',
            borderBottom: '1px solid rgba(245,158,11,0.3)',
          }}
        />

        <div
          className='flex items-center justify-between border-b px-3 py-2'
          style={{
            borderColor: '#2a2e36',
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
          }}
        >
          <span
            className='font-mono text-[9px] font-bold uppercase tracking-[0.35em]'
            style={{
              color: '#94a3b8',
              textShadow: '0 0 8px rgba(148,163,184,0.3)',
            }}
          >
            ▸ STATUS
          </span>
          <span
            className='h-1.5 w-1.5 rounded-full'
            style={{
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e, inset 0 0 2px rgba(255,255,255,0.5)',
            }}
          />
        </div>

        <div className='relative p-3 sm:p-4'>
          <div className='mb-4 flex gap-3'>
            <div
              className='relative flex min-w-0 flex-1 flex-col items-center justify-center p-4'
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(30,35,45,0.9) 0%, rgba(10,12,16,1) 100%)',
                border: '1px solid #2a2e36',
                boxShadow:
                  'inset 0 0 20px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.03)',
              }}
            >
              <div
                className='absolute inset-0'
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.08) 90deg, transparent 180deg)',
                  mask: 'radial-gradient(circle, transparent 70%, black 70%)',
                  WebkitMask:
                    'radial-gradient(circle, transparent 70%, black 70%)',
                }}
              />
              <p
                className='font-mono text-[8px] font-bold uppercase tracking-[0.3em]'
                style={{ color: '#64748b' }}
              >
                TRACKED
              </p>
              <p
                className='mt-1 font-mono text-2xl font-bold tabular-nums sm:text-3xl'
                style={{
                  color: '#f59e0b',
                  textShadow: '0 0 12px rgba(245,158,11,0.4)',
                }}
              >
                {startups.length}
              </p>
              <p
                className='mt-0.5 font-mono text-[8px] uppercase'
                style={{ color: '#64748b' }}
              >
                startups
              </p>
            </div>
            <div
              className='relative flex min-w-0 flex-1 flex-col items-center justify-center p-4'
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(30,35,45,0.9) 0%, rgba(10,12,16,1) 100%)',
                border: '1px solid #2a2e36',
                boxShadow:
                  'inset 0 0 20px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.03)',
              }}
            >
              <div
                className='absolute inset-0'
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(34,197,94,0.08) 90deg, transparent 180deg)',
                  mask: 'radial-gradient(circle, transparent 70%, black 70%)',
                  WebkitMask:
                    'radial-gradient(circle, transparent 70%, black 70%)',
                }}
              />
              <p
                className='font-mono text-[8px] font-bold uppercase tracking-[0.3em]'
                style={{ color: '#64748b' }}
              >
                EST. VALUE
              </p>
              <p
                className='mt-1 font-mono text-xl font-bold tabular-nums sm:text-2xl'
                style={{
                  color: '#22c55e',
                  textShadow: '0 0 12px rgba(34,197,94,0.4)',
                }}
              >
                {formatEstValue(estValue)}
              </p>
              <p
                className='mt-0.5 font-mono text-[8px] uppercase'
                style={{ color: '#64748b' }}
              >
                total
              </p>
            </div>
          </div>

          <div
            className='relative mb-3 p-2.5'
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid #2a2e36',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            }}
          >
            <p
              className='mb-2 font-mono text-[8px] font-bold uppercase tracking-[0.25em]'
              style={{ color: '#64748b' }}
            >
              ▸ COUNTRIES
            </p>
            <div className='relative'>
              <div
                ref={scrollRef}
                className='flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1 scrollbar-none'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {topCountries.map(([code, count]) => (
                  <span
                    key={code}
                    className='inline-flex shrink-0 items-center gap-1.5 px-2 py-1 font-mono text-[10px]'
                    style={{
                      background: 'rgba(42,46,54,0.8)',
                      border: '1px solid #374151',
                      color: '#e5e7eb',
                    }}
                  >
                    <span className='text-sm leading-none'>
                      {flag(code) ?? '🏳️'}
                    </span>
                    <span className='max-w-[70px] truncate sm:max-w-[90px]'>
                      {countryName(code) ?? code}
                    </span>
                    <span style={{ color: '#64748b' }}>{count}</span>
                  </span>
                ))}
              </div>
              <div
                className='pointer-events-none absolute right-0 top-0 bottom-1 w-6 shrink-0'
                style={{
                  background: 'linear-gradient(90deg, transparent, #0f1216)',
                }}
              />
            </div>
          </div>

          <div
            className='relative mb-4 p-2.5'
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid #2a2e36',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            }}
          >
            <p
              className='mb-2 font-mono text-[8px] font-bold uppercase tracking-[0.25em]'
              style={{ color: '#64748b' }}
            >
              ▸ CATEGORIES
            </p>
            <div className='relative'>
              <div
                className='flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1 scrollbar-none'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {topCategories.map(([cat, count]) => (
                  <span
                    key={cat}
                    className='shrink-0 px-2 py-1 font-mono text-[10px]'
                    style={{
                      background: 'rgba(42,46,54,0.8)',
                      border: '1px solid #374151',
                      color: '#e5e7eb',
                    }}
                  >
                    <span className='max-w-[100px] truncate sm:max-w-[120px]'>
                      {cat}
                    </span>
                    <span style={{ color: '#64748b' }}> ×{count}</span>
                  </span>
                ))}
              </div>
              <div
                className='pointer-events-none absolute right-0 top-0 bottom-1 w-6 shrink-0'
                style={{
                  background: 'linear-gradient(90deg, transparent, #0f1216)',
                }}
              />
            </div>
          </div>

          <div className='border-t pt-3' style={{ borderColor: '#2a2e36' }}>
            <button
              type='button'
              onClick={() => setFiltersOpen(!filtersOpen)}
              className='flex w-full items-center justify-between px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors'
              style={{
                background: filtersOpen
                  ? 'rgba(245,158,11,0.08)'
                  : 'rgba(42,46,54,0.6)',
                border: '1px solid #374151',
                color: filtersOpen ? '#f59e0b' : '#94a3b8',
              }}
            >
              <span>▸ SEARCH PARAMETERS</span>
              <span
                className='font-mono text-[8px]'
                style={{ color: '#64748b' }}
              >
                {filtersOpen ? '[ ACTIVE ]' : '[ STANDBY ]'}
              </span>
            </button>
            {filtersOpen && (
              <div
                className='mt-3 min-w-0 overflow-hidden p-3'
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid #2a2e36',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                }}
              >
                <FiltersBar
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  variant='dark'
                  compact
                />
              </div>
            )}
          </div>
        </div>

        <div
          className='absolute right-2 top-8 h-2 w-2 rounded-full'
          style={{
            background: '#374151',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />
        <div
          className='absolute bottom-2 right-2 h-2 w-2 rounded-full'
          style={{
            background: '#374151',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />
        <div
          className='absolute bottom-2 left-2 h-2 w-2 rounded-full'
          style={{
            background: '#374151',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>
    </div>
  );
}
