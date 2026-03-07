'use client';

export function RadarSweepOverlay() {
  return (
    <div
      className='pointer-events-none absolute inset-0 z-9999 flex items-center justify-center'
      aria-hidden
    >
      {/* Radar scope - circular, centered, scales with viewport */}
      <div
        className='aspect-square w-[min(100vw,100vh)] max-w-[120vmin]'
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 0%, transparent 70%, rgba(245,158,11,0.03) 100%),
            conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.18) 36deg, rgba(245,158,11,0.08) 42deg, transparent 50deg, transparent 360deg)
          `,
          mask: 'radial-gradient(circle, black 0%, black 70%, transparent 71%)',
          WebkitMask:
            'radial-gradient(circle, black 0%, black 70%, transparent 71%)',
          animation: 'radar-sweep 4s linear infinite',
        }}
      />
      {/* Concentric rings - pure CSS */}
      <div
        className='pointer-events-none absolute inset-0 flex items-center justify-center'
        style={{
          background: 'transparent',
          mask: 'radial-gradient(circle, transparent 0%, black 20%, transparent 21%, black 40%, transparent 41%, black 60%, transparent 61%, black 80%, transparent 81%)',
          WebkitMask:
            'radial-gradient(circle, transparent 0%, black 20%, transparent 21%, black 40%, transparent 41%, black 60%, transparent 61%, black 80%, transparent 81%)',
        }}
      >
        <div
          className='aspect-square w-[min(100vw,100vh)] max-w-[120vmin] rounded-full border'
          style={{
            borderColor: 'rgba(245,158,11,0.12)',
            borderWidth: 1,
          }}
        />
      </div>
    </div>
  );
}
