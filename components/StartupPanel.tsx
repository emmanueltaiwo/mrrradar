'use client';

import { flag, name as countryName } from 'country-emoji';
import { motion, AnimatePresence } from 'motion/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Startup } from '@/types/startup';

type Props = {
  startup: Startup | null;
  onClose: () => void;
};

function formatMrr(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function formatGrowth(rate: number | undefined) {
  if (rate == null) return '—';
  const pct = typeof rate === 'number' && rate <= 1 ? rate * 100 : rate;
  return `${Number(pct).toFixed(1)}%`;
}

function RevenueChart({ startup }: { startup: Startup }) {
  const last30 = startup.revenueLast30Days / 100;
  const mrr = startup.mrr / 100;

  const data = [
    { name: 'Last 30d', value: last30 },
    { name: 'MRR', value: mrr },
  ].filter((d) => d.value > 0);
  if (data.length === 0) {
    return (
      <div
        className='flex h-20 items-center justify-center font-mono text-[10px] uppercase tracking-wider'
        style={{ color: '#64748b' }}
      >
        [ NO DATA ]
      </div>
    );
  }

  return (
    <div className='h-20 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#f59e0b' stopOpacity={0.4} />
              <stop offset='100%' stopColor='#f59e0b' stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='name'
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            tick={{
              fontSize: 9,
              fill: '#64748b',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <YAxis hide domain={[0, (max: number) => Math.max(max * 1.1, 1)]} />
          <Tooltip
            contentStyle={{
              background: '#0f1216',
              border: '1px solid #374151',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
            labelStyle={{ color: '#64748b' }}
            formatter={(value) => [
              `$${Number(value ?? 0).toLocaleString()}`,
              'Revenue',
            ]}
            labelFormatter={(label) => label}
          />
          <Area
            type='monotone'
            dataKey='value'
            stroke='#f59e0b'
            strokeWidth={1.5}
            fill='url(#revenueGradient)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StartupPanel({ startup, onClose }: Props) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <AnimatePresence>
      {startup && (
        <motion.aside
          key={startup.slug}
          initial={isMobile ? { y: '100%' } : { x: '100%' }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: '100%' }}
          transition={{
            type: 'spring',
            damping: 28,
            stiffness: 300,
          }}
          className={
            isMobile
              ? 'absolute bottom-0 left-0 right-0 z-40 flex w-full max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl safe-area-pb'
              : 'absolute right-0 top-0 bottom-0 z-40 flex max-h-[100dvh] w-[420px] max-w-full flex-col overflow-hidden'
          }
          style={{
            ...(!isMobile && { right: 0, left: 'auto', top: 0, bottom: 0 }),
            background:
              'linear-gradient(180deg, #1a1d24 0%, #0f1216 50%, #0a0c10 100%)',
            ...(isMobile
              ? {
                  borderTop: '2px solid #2a2e36',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.04), 0 -20px 60px rgba(0,0,0,0.7)',
                }
              : {
                  left: 'auto',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 420,
                  maxWidth: '100%',
                  borderLeft: '2px solid #2a2e36',
                  boxShadow:
                    'inset 1px 0 0 rgba(255,255,255,0.04), -20px 0 60px rgba(0,0,0,0.7)',
                }),
          }}
        >
          {isMobile && (
            <div className='flex justify-center pt-2 pb-1'>
              <div
                className='h-1 w-12 rounded-full'
                style={{ background: '#374151' }}
                aria-hidden
              />
            </div>
          )}
          <div
            className='h-1.5 w-full'
            style={{
              background:
                'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 6px, #0a0c10 6px, #0a0c10 12px)',
              borderBottom: '1px solid rgba(245,158,11,0.3)',
            }}
          />
          <div
            className='pointer-events-none absolute inset-0 opacity-[0.03]'
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />

          <div
            className='absolute left-0 top-0 h-16 w-16'
            style={{
              background:
                'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, transparent 50%)',
              clipPath: 'polygon(0 0, 100% 0, 0 100%)',
            }}
          />

          <div
            className='relative flex items-start justify-between gap-4 border-b px-5 py-4'
            style={{
              borderColor: '#2a2e36',
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }}
          >
            <div className='flex min-w-0 flex-1 items-center gap-4'>
              {startup.logo && (
                <div
                  className='flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden'
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid #374151',
                    clipPath:
                      'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                  }}
                >
                  <img
                    src={startup.logo}
                    alt=''
                    width={56}
                    height={56}
                    className='h-11 w-11 object-contain'
                  />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <p
                  className='font-mono text-[9px] font-bold uppercase tracking-[0.3em]'
                  style={{ color: '#64748b' }}
                >
                  ▸ STARTUP PROFILE
                </p>
                <h2
                  className='mt-1 truncate text-base font-bold uppercase tracking-wider'
                  style={{ color: '#e5e7eb' }}
                >
                  {startup.name}
                </h2>
                {startup.website && (
                  <a
                    href={startup.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-0.5 block truncate font-mono text-[10px] transition-colors'
                    style={{ color: '#f59e0b' }}
                  >
                    &gt; {startup.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            <button
              type='button'
              onClick={onClose}
              className='group flex shrink-0 cursor-pointer flex-col items-center justify-center transition-all hover:scale-105 active:scale-95'
              aria-label='Close panel'
              style={{
                width: 48,
                height: 48,
                background: 'rgba(42,46,54,0.8)',
                border: '1px solid #374151',
                clipPath:
                  'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)',
              }}
            >
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                className='transition-colors'
                style={{ color: '#94a3b8' }}
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
              <span
                className='mt-1 font-mono text-[8px] uppercase tracking-widest'
                style={{ color: '#64748b' }}
              >
                Close
              </span>
            </button>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-5'>
            <div className='grid grid-cols-2 gap-2'>
              {[
                {
                  label: 'MRR',
                  value: formatMrr(startup.mrr),
                  unit: '/mo',
                  accent: true,
                },
                {
                  label: 'Growth 30d',
                  value: formatGrowth(startup.growthRate),
                  unit: '',
                  accent: false,
                },
                {
                  label: 'Customers',
                  value: startup.customers.toLocaleString(),
                  unit: '',
                  accent: false,
                },
                {
                  label: 'Active subs',
                  value: startup.activeSubscriptions.toLocaleString(),
                  unit: '',
                  accent: false,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='relative overflow-hidden p-3'
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid #374151',
                    clipPath:
                      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                  }}
                >
                  <div
                    className='absolute left-0 top-0 h-full w-[2px]'
                    style={{ background: stat.accent ? '#f59e0b' : '#374151' }}
                  />
                  <p
                    className='font-mono text-[9px] uppercase tracking-[0.2em]'
                    style={{ color: '#64748b' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className='mt-1 font-mono text-lg font-bold tabular-nums'
                    style={{ color: stat.accent ? '#f59e0b' : '#e5e7eb' }}
                  >
                    {stat.value}
                    {stat.unit && (
                      <span
                        className='ml-1 text-xs font-normal'
                        style={{ color: '#64748b' }}
                      >
                        {stat.unit}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className='mt-4 flex flex-wrap gap-2'>
              {startup.category && (
                <div
                  className='flex items-center gap-2 px-3 py-2'
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid #374151',
                  }}
                >
                  <span
                    className='font-mono text-[9px]'
                    style={{ color: '#64748b' }}
                  >
                    [ CAT ]
                  </span>
                  <span
                    className='font-mono text-[11px]'
                    style={{ color: '#e5e7eb' }}
                  >
                    {startup.category}
                  </span>
                </div>
              )}
              {startup.country && (
                <div
                  className='flex items-center gap-2 px-3 py-2'
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid #374151',
                  }}
                >
                  <span className='text-base leading-none'>
                    {flag(startup.country) ?? '🏳️'}
                  </span>
                  <span
                    className='font-mono text-[11px]'
                    style={{ color: '#e5e7eb' }}
                  >
                    {countryName(startup.country) ?? startup.country}
                  </span>
                </div>
              )}
            </div>

            <div
              className='mt-6 overflow-hidden p-4'
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid #374151',
                clipPath:
                  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              <p
                className='font-mono text-[9px] uppercase tracking-[0.25em]'
                style={{ color: '#64748b' }}
              >
                [ Revenue scope ]
              </p>
              <RevenueChart startup={startup} />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
