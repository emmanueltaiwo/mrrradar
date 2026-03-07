import { ImageResponse } from 'next/og';

export const alt = 'MRRRADAR — Profitable startups. Verified. Live.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0c10',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        border: '2px solid #2a2e36',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 6,
          flexShrink: 0,
          background:
            'repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 10px, #0a0c10 10px, #0a0c10 20px)',
        }}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: '42%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #1a1d24 0%, #0f1216 100%)',
            borderRight: '1px solid #2a2e36',
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '2px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid rgba(245, 158, 11, 0.15)',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '2px solid rgba(245, 158, 11, 0.1)',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 24px rgba(34, 197, 94, 0.6)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#22c55e',
                letterSpacing: '0.2em',
              }}
            >
              LIVE
            </span>
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#f59e0b',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            MRRRADAR
          </h1>

          <p
            style={{
              fontSize: 22,
              color: '#94a3b8',
              letterSpacing: '0.04em',
              margin: '16px 0 0',
              fontWeight: 500,
            }}
          >
            Profitable startups. Verified. Live.
          </p>

          <div
            style={{
              display: 'flex',
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid #2a2e36',
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: '#64748b',
                fontFamily: 'monospace',
              }}
            >
              mrrradar.com
            </span>
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
