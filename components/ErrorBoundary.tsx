'use client';

import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className='flex min-h-dvh flex-col items-center justify-center gap-6 p-8'
          style={{
            background:
              'linear-gradient(180deg, #0a0c10 0%, #0f1216 50%, #1a1d24 100%)',
          }}
        >
          <div
            className='flex flex-col items-center gap-4 rounded-lg border p-8'
            style={{
              borderColor: '#374151',
              background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
            }}
          >
            <div
              className='flex h-16 w-16 items-center justify-center rounded-full'
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <svg
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ef4444'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='12' y1='8' x2='12' y2='12' />
                <line x1='12' y1='16' x2='12.01' y2='16' />
              </svg>
            </div>
            <h1
              className='text-center font-mono text-lg font-bold uppercase tracking-wider'
              style={{ color: '#ef4444' }}
            >
              Something went wrong
            </h1>
            <p
              className='max-w-md text-center font-mono text-sm'
              style={{ color: '#64748b' }}
            >
              An unexpected error occurred. Please refresh the page to try
              again.
            </p>
            <button
              type='button'
              onClick={() => window.location.reload()}
              className='mt-2 rounded border px-6 py-2 font-mono text-sm uppercase tracking-wider transition-colors'
              style={{
                borderColor: '#f59e0b',
                color: '#f59e0b',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}