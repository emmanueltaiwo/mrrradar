'use client';

import { useState } from 'react';
import { flag } from 'country-emoji';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDollars } from '@/lib/format';
import type { Startup } from '@/types/startup';

type Props = {
  startups: Startup[];
  selectedSlug: string | null;
  onSelectStartup: (slug: string | null) => void;
};

function formatTimeAgo(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

export function ActivityLog({
  startups,
  selectedSlug,
  onSelectStartup,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const recent = [...startups]
    .filter((s) => s.lastSyncedAt != null)
    .sort((a, b) => (b.lastSyncedAt ?? 0) - (a.lastSyncedAt ?? 0))
    .slice(0, isMobile ? 6 : 12);

  const isCollapsed = isMobile && !expanded;

  /* Mobile: full-width bottom strip (like desktop) - collapsible to slim bar so it's never buried */
  if (isMobile) {
    return (
      <div
        className='absolute bottom-0 left-0 right-0 z-30 sm:hidden'
        style={{
          background:
            'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
          borderTop: '2px solid #2a2e36',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.03), 0 -8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className='h-1 w-full'
          style={{
            background:
              'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 6px, #0a0c10 6px, #0a0c10 12px)',
            borderBottom: '1px solid rgba(245,158,11,0.2)',
          }}
        />
        <div
          className={`flex flex-col transition-all ${
            isCollapsed
              ? 'max-h-[48px] overflow-hidden'
              : 'max-h-[45dvh] overflow-hidden'
          }`}
        >
          <button
            type='button'
            onClick={() => setExpanded(!expanded)}
            className='flex w-full items-center justify-between px-4 py-2.5 touch-manipulation'
            aria-expanded={expanded}
            aria-label={
              isCollapsed ? 'Expand activity log' : 'Collapse activity log'
            }
          >
            <span
              className='font-mono text-[8px] font-bold uppercase tracking-[0.3em]'
              style={{ color: '#64748b' }}
            >
              ▸ ACTIVITY LOG ({recent.length})
            </span>
            <span className='font-mono text-[9px]' style={{ color: '#64748b' }}>
              {isCollapsed ? '▼' : '▲'}
            </span>
          </button>
          <div
            className={`overflow-x-auto overflow-y-auto px-4 pb-3 scrollbar-none ${
              isCollapsed ? 'hidden' : 'min-h-0 max-h-[calc(45dvh-48px)]'
            }`}
          >
            {recent.length === 0 ? (
              <p
                className='py-1 font-mono text-[10px] uppercase tracking-wider'
                style={{ color: '#64748b' }}
              >
                [ No activity ]
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {recent.map((s) => (
                  <button
                    key={s.slug}
                    type='button'
                    onClick={() =>
                      onSelectStartup(selectedSlug === s.slug ? null : s.slug)
                    }
                    className='flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9px] touch-manipulation'
                    style={{
                      background:
                        selectedSlug === s.slug
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(42,46,54,0.8)',
                      border: `1px solid ${selectedSlug === s.slug ? '#f59e0b' : '#374151'}`,
                      color: '#e5e7eb',
                    }}
                  >
                    <span className='text-sm'>
                      {flag(s.country ?? '') ?? '🌐'}
                    </span>
                    <span className='max-w-[100px] truncate'>{s.name}</span>
                    <span style={{ color: '#64748b' }}>
                      {formatDollars(s.mrr ?? 0)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* Desktop: full-width bottom strip */
  return (
    <div
      className='absolute bottom-0 left-0 right-0 z-20 overflow-hidden sm:block'
      style={{
        background:
          'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
        borderTop: '2px solid #2a2e36',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.03), 0 -8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div
        className='h-1 w-full'
        style={{
          background:
            'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 6px, #0a0c10 6px, #0a0c10 12px)',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
        }}
      />
      <div className='relative flex items-center gap-3 overflow-x-auto px-4 py-2.5 scrollbar-none'>
        <span
          className='shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.3em]'
          style={{ color: '#64748b' }}
        >
          ▸ ACTIVITY LOG
        </span>
        <div className='h-4 w-px shrink-0' style={{ background: '#374151' }} />
        {recent.length === 0 ? (
          <p
            className='py-1 font-mono text-[10px] uppercase tracking-wider'
            style={{ color: '#64748b' }}
          >
            [ No activity ]
          </p>
        ) : (
          <div className='flex gap-2'>
            {recent.map((s) => (
              <button
                key={s.slug}
                type='button'
                onClick={() =>
                  onSelectStartup(selectedSlug === s.slug ? null : s.slug)
                }
                className='flex shrink-0 items-center gap-2 border px-3 py-1.5 font-mono text-[10px] transition-all'
                style={{
                  background:
                    selectedSlug === s.slug
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(42,46,54,0.8)',
                  border: `1px solid ${selectedSlug === s.slug ? '#f59e0b' : '#374151'}`,
                  color: '#e5e7eb',
                  boxShadow:
                    selectedSlug === s.slug
                      ? '0 0 12px rgba(245,158,11,0.2)'
                      : 'inset 0 0 10px rgba(0,0,0,0.4)',
                }}
              >
                <span className='text-sm leading-none'>
                  {flag(s.country ?? '') ?? '🌐'}
                </span>
                <span className='max-w-[140px] truncate'>{s.name}</span>
                <span style={{ color: '#64748b' }}>
                  {formatDollars(s.mrr ?? 0)}
                </span>
                <span style={{ color: '#64748b' }}>
                  {formatTimeAgo(s.lastSyncedAt ?? 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
