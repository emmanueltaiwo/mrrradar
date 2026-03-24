import {
  OG_SIZE,
  OG_COLORS,
  countryToFlag,
  formatOgdollars,
  formatFoundedDate,
} from './og-styles';
import type { Startup } from '@/types/startup';

export { OG_SIZE };

function XIconSvg({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      style={{ color: OG_COLORS.textMuted }}
    >
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );
}

export function DefaultOgImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: OG_COLORS.bg,
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 8,
          flexShrink: 0,
          background: OG_COLORS.stripe,
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          minHeight: 0,
          border: `2px solid ${OG_COLORS.border}`,
          borderTop: 'none',
          margin: '0 24px 24px',
          boxShadow: `0 0 80px ${OG_COLORS.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        <div
          style={{
            width: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: OG_COLORS.panel,
            borderRight: `1px solid ${OG_COLORS.border}`,
            position: 'relative',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 80 + i * 50,
                height: 80 + i * 50,
                borderRadius: '50%',
                border: `1px solid ${OG_COLORS.border}`,
                opacity: 0.4 - i * 0.08,
              }}
            />
          ))}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${OG_COLORS.accent} 0%, transparent 70%)`,
              boxShadow: `0 0 40px ${OG_COLORS.accentGlow}`,
              position: 'relative',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: OG_COLORS.live,
              boxShadow: `0 0 20px ${OG_COLORS.liveGlow}`,
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: OG_COLORS.live,
                boxShadow: `0 0 12px ${OG_COLORS.liveGlow}`,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: OG_COLORS.live,
                letterSpacing: '0.25em',
              }}
            >
              LIVE
            </span>
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: OG_COLORS.accent,
              margin: 0,
              lineHeight: 1,
              textShadow: `0 0 40px ${OG_COLORS.accentGlow}`,
            }}
          >
            MRRRADAR
          </h1>
          <p
            style={{
              fontSize: 26,
              color: OG_COLORS.textMuted,
              letterSpacing: '0.05em',
              margin: '20px 0 0',
              fontWeight: 500,
            }}
          >
            Profitable startups. Verified. Live.
          </p>
          <div
            style={{
              display: 'flex',
              marginTop: 36,
              paddingTop: 28,
              borderTop: `1px solid ${OG_COLORS.border}`,
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 15,
                color: OG_COLORS.textDim,
                fontFamily: 'monospace',
              }}
            >
              mrrradar.com
            </span>
            <span style={{ color: OG_COLORS.border }}>|</span>
            <span
              style={{
                fontSize: 15,
                color: OG_COLORS.textDim,
              }}
            >
              Filter by country · revenue · growth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StartupOgImage({ startup }: { startup: Startup }) {
  const mrr = startup.mrr ?? 0;
  const total = startup.revenueTotal ?? 0;
  const founded = formatFoundedDate(startup.foundedDate);
  const countryFlag = startup.country ? countryToFlag(startup.country) : '🌐';
  const xHandle = startup.xHandle?.replace(/^@/, '');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: OG_COLORS.bg,
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 8,
          flexShrink: 0,
          background: OG_COLORS.stripe,
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          minHeight: 0,
          border: `2px solid ${OG_COLORS.border}`,
          borderTop: 'none',
          margin: '0 24px 24px',
          boxShadow: `0 0 80px ${OG_COLORS.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        <div
          style={{
            width: '36%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: OG_COLORS.panel,
            borderRight: `1px solid ${OG_COLORS.border}`,
            padding: 40,
          }}
        >
          {startup.logo ? (
            <img
              src={startup.logo}
              alt=''
              width={140}
              height={140}
              style={{
                borderRadius: 16,
                objectFit: 'contain',
                border: `2px solid ${OG_COLORS.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                border: `2px solid ${OG_COLORS.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 100%)`,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: OG_COLORS.accent,
                  opacity: 0.8,
                }}
              >
                {(startup.name?.charAt(0) ?? '?').toUpperCase()}
              </span>
            </div>
          )}
          <span
            style={{
              marginTop: 20,
              fontSize: 12,
              fontWeight: 600,
              color: OG_COLORS.textDim,
              letterSpacing: '0.2em',
            }}
          >
            ON MRRRADAR
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: OG_COLORS.accent,
                letterSpacing: '0.2em',
              }}
            >
              MRRRADAR
            </span>
            <span style={{ color: OG_COLORS.border }}>→</span>
          </div>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: OG_COLORS.text,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {startup.name}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 16,
              marginTop: 20,
            }}
          >
            {startup.country && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 18,
                  color: OG_COLORS.textMuted,
                }}
              >
                <span style={{ fontSize: 24 }}>{countryFlag}</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                  {startup.country}
                </span>
              </div>
            )}
            {xHandle && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 16,
                  color: OG_COLORS.textMuted,
                }}
              >
                <XIconSvg size={18} />
                <span style={{ fontWeight: 500 }}>@{xHandle}</span>
              </div>
            )}
            {founded && (
              <span
                style={{
                  fontSize: 16,
                  color: OG_COLORS.textDim,
                }}
              >
                Founded {founded}
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 28,
              paddingTop: 24,
              borderTop: `1px solid ${OG_COLORS.border}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  color: OG_COLORS.textDim,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                MRR
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: OG_COLORS.accent,
                  textShadow: `0 0 20px ${OG_COLORS.accentGlow}`,
                }}
              >
                {formatOgdollars(mrr)}
              </span>
            </div>
            {total > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  paddingLeft: 32,
                  borderLeft: `1px solid ${OG_COLORS.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: OG_COLORS.textDim,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  Total Revenue
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: OG_COLORS.textMuted,
                  }}
                >
                  {formatOgdollars(total)}
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 13,
              color: OG_COLORS.textDim,
              fontFamily: 'monospace',
            }}
          >
            mrrradar.com
          </div>
        </div>
      </div>
    </div>
  );
}
