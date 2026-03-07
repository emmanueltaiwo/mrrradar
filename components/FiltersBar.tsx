'use client';

import type { Filters } from './Dashboard';

type Props = {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  variant?: 'dark' | 'light';
  compact?: boolean;
};

const FilterInput = ({
  label,
  channel,
  children,
  className = '',
}: {
  label: string;
  channel: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label
      className='flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.2em]'
      style={{ color: '#64748b' }}
    >
      <span style={{ color: '#f59e0b' }}>CH.{channel}</span>
      <span>{label}</span>
    </label>
    {children}
  </div>
);

const inputBase =
  'h-9 min-w-0 w-full px-3 font-mono text-[11px] uppercase tracking-wider outline-none transition-all placeholder:uppercase' +
  ' bg-[#0f1216] border border-[#374151] text-[#e5e7eb] placeholder:text-[#64748b]' +
  ' focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 focus:bg-[#14171c]';

export function FiltersBar({
  filters,
  onFiltersChange,
  variant = 'dark',
  compact = false,
}: Props) {
  const update = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (compact) {
    return (
      <div className='grid min-w-0 grid-cols-1 gap-4'>
        <FilterInput label='Startup name' channel='01' className='w-full'>
          <input
            type='text'
            placeholder='Enter name...'
            value={filters.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputBase}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}
          />
        </FilterInput>
        <FilterInput label='Country' channel='02'>
          <input
            type='text'
            placeholder='Country code...'
            value={filters.country}
            onChange={(e) => update('country', e.target.value)}
            className={inputBase}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}
          />
        </FilterInput>
        <div className='grid grid-cols-2 gap-4'>
          <FilterInput label='Min value ($)' channel='03'>
            <input
              type='number'
              placeholder='0'
              value={filters.minMrr}
              onChange={(e) => update('minMrr', e.target.value)}
              min={0}
              className={inputBase}
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
              }}
            />
          </FilterInput>
          <FilterInput label='Max value ($)' channel='04'>
            <input
              type='number'
              placeholder='∞'
              value={filters.maxMrr}
              onChange={(e) => update('maxMrr', e.target.value)}
              min={0}
              className={inputBase}
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
              }}
            />
          </FilterInput>
        </div>
      </div>
    );
  }

  return (
    <div
      className='flex min-w-0 flex-wrap items-end gap-4'
      style={{
        background: 'rgba(15,18,22,0.9)',
        border: '1px solid #2a2e36',
        padding: '12px 16px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
      }}
    >
      <FilterInput
        label='Startup name'
        channel='01'
        className='min-w-[120px] flex-1'
      >
        <input
          type='text'
          placeholder='Name...'
          value={filters.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputBase}
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
        />
      </FilterInput>
      <FilterInput label='Country' channel='02' className='min-w-[80px]'>
        <input
          type='text'
          placeholder='XX'
          value={filters.country}
          onChange={(e) => update('country', e.target.value)}
          className={inputBase}
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
        />
      </FilterInput>
      <FilterInput label='Min $' channel='03' className='w-20'>
        <input
          type='number'
          placeholder='0'
          value={filters.minMrr}
          onChange={(e) => update('minMrr', e.target.value)}
          min={0}
          className={inputBase}
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
        />
      </FilterInput>
      <FilterInput label='Max $' channel='04' className='w-20'>
        <input
          type='number'
          placeholder='∞'
          value={filters.maxMrr}
          onChange={(e) => update('maxMrr', e.target.value)}
          min={0}
          className={inputBase}
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
        />
      </FilterInput>
    </div>
  );
}
