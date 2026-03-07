'use client';

import { useState } from 'react';
import { flag } from 'country-emoji';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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

  /* Mobile: compact pill in corner when collapsed, bottom sheet when expanded */
  if (isMobile && isCollapsed) {
    return (
      <button
        type='button'
        onClick={() => setExpanded(true)}
        className='absolute bottom-2 right-2 z-20 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 touch-manipulation'
        style={{
          background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
          border: '1px solid #2a2e36',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
        aria-label={`Expand activity log (${recent.length} items)`}
      >
        <span
          className='font-mono text-[9px] font-bold uppercase'
          style={{ color: '#64748b' }}
        >
          ▸
        </span>
        <span
          className='font-mono text-[10px] font-bold tabular-nums'
          style={{ color: '#f59e0b' }}
        >
          {recent.length}
        </span>
        <span className='font-mono text-[9px]' style={{ color: '#64748b' }}>
          activity
        </span>
      </button>
    );
  }

  /* Mobile expanded: bottom sheet overlay */
  if (isMobile && expanded) {
    return (
      <>
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
            className='relative z-10 max-h-[35vh] w-full max-w-[100%] overflow-hidden rounded-t-2xl'
            style={{
              background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
              border: '2px solid #2a2e36',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div
              className='sticky top-0 flex items-center justify-between border-b px-4 py-2'
              style={{ borderColor: '#2a2e36', background: '#1a1d24' }}
            >
              <span
                className='font-mono text-[9px] font-bold uppercase tracking-wider'
                style={{ color: '#94a3b8' }}
              >
                ▸ ACTIVITY LOG
              </span>
              <button
                type='button'
                onClick={() => setExpanded(false)}
                className='font-mono text-[9px] touch-manipulation'
                style={{ color: '#64748b' }}
              >
                Close
              </button>
            </div>
            <div className='overflow-x-auto px-3 py-2 scrollbar-none'>
              {recent.length === 0 ? (
                <p
                  className='py-2 font-mono text-[10px] uppercase'
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
                      className='flex shrink-0 items-center gap-1.5 border px-2 py-1.5 font-mono text-[9px] touch-manipulation'
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
                      <span className='max-w-[80px] truncate'>{s.name}</span>
                      <span style={{ color: '#64748b' }}>
                        ${((s.mrr ?? 0) / 100).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
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
                  ${((s.mrr ?? 0) / 100).toLocaleString()}
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
