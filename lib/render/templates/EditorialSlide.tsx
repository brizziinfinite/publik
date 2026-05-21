import React from 'react';
import type { BrandVisualIdentityV2 } from '@/types/visual-kits';

export type SlideRole = 'hook' | 'content' | 'cta';

export interface EditorialSlideProps {
  role: SlideRole;
  slideNumber: number;
  totalSlides: number;
  title: string;
  body?: string;
  pretitle?: string;
  brandName: string;
  tokens: BrandVisualIdentityV2;
  width: number;
  height: number;
  safeZone?: { top: number; right: number; bottom: number; left: number };
  // CTA-only
  ctaText?: string;
  priceMain?: string;
  priceCompare?: string;
}

export function contrastText(bgHex: string): 'light' | 'dark' {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
}

export function EditorialSlide(props: EditorialSlideProps) {
  if (props.role === 'hook') return <HookLayout {...props} />;
  if (props.role === 'cta') return <CtaLayout {...props} />;
  return <ContentLayout {...props} />;
}

// ─── HOOK LAYOUT (slide 1) ────────────────────────────────────────────────────

function HookLayout({
  title,
  body,
  pretitle,
  brandName,
  tokens,
  width,
  height,
  safeZone = { top: 80, right: 80, bottom: 80, left: 80 },
}: EditorialSlideProps) {
  const p = tokens.palette;
  const t = tokens.typography;
  const px = safeZone.left;
  const py = safeZone.top;
  const contentWidth = width - safeZone.left - safeZone.right;

  const titleSize = Math.round(width * 0.075); // ~81px em 1080
  const bodySize = Math.round(width * 0.026);  // ~28px
  const monoSize = Math.round(width * 0.020);  // ~22px

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        backgroundColor: p.bg,
        padding: `${py}px ${px}px`,
        position: 'relative',
      }}
    >
      {/* Linha decorativa superior */}
      <div
        style={{
          display: 'flex',
          width: Math.round(contentWidth * 0.15),
          height: 3,
          backgroundColor: p.accent,
          marginBottom: 24,
        }}
      />

      {/* Pretitle / eyebrow */}
      {pretitle ? (
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: monoSize,
            color: p.accent,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            marginBottom: 20,
          }}
        >
          {pretitle}
        </div>
      ) : null}

      {/* Title principal */}
      <div
        style={{
          display: 'flex',
          fontFamily: t.display_font,
          fontWeight: 800,
          fontSize: titleSize,
          color: p.text,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          maxWidth: contentWidth,
          marginBottom: 32,
          flexWrap: 'wrap' as const,
        }}
      >
        {title}
      </div>

      {/* Body */}
      {body ? (
        <div
          style={{
            display: 'flex',
            fontFamily: t.body_font,
            fontSize: bodySize,
            color: p.muted,
            lineHeight: 1.55,
            maxWidth: Math.round(contentWidth * 0.85),
            flexWrap: 'wrap' as const,
          }}
        >
          {body}
        </div>
      ) : null}

      {/* Spacer */}
      <div style={{ display: 'flex', flex: 1 }} />

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: contentWidth,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: monoSize,
            color: p.muted,
            letterSpacing: '0.04em',
          }}
        >
          {brandName}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: monoSize,
            color: p.accent,
            letterSpacing: '0.04em',
          }}
        >
          arrasta →
        </div>
      </div>
    </div>
  );
}

// ─── CONTENT LAYOUT (slides intermediários) ───────────────────────────────────

function ContentLayout({
  slideNumber,
  totalSlides,
  title,
  body,
  brandName,
  tokens,
  width,
  height,
  safeZone = { top: 80, right: 80, bottom: 80, left: 80 },
}: EditorialSlideProps) {
  const p = tokens.palette;
  const t = tokens.typography;
  const px = safeZone.left;
  const py = safeZone.top;
  const contentWidth = width - safeZone.left - safeZone.right;

  const numSize = Math.round(width * 0.12);  // número grande decorativo
  const titleSize = Math.round(width * 0.056);
  const bodySize = Math.round(width * 0.028);
  const monoSize = Math.round(width * 0.018);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        backgroundColor: p.bg,
        padding: `${py}px ${px}px`,
        position: 'relative',
      }}
    >
      {/* Número do slide decorativo */}
      <div
        style={{
          display: 'flex',
          fontFamily: t.display_font,
          fontWeight: 800,
          fontSize: numSize,
          color: p.accent,
          opacity: 0.12,
          lineHeight: 1,
          marginBottom: -Math.round(numSize * 0.3),
        }}
      >
        {String(slideNumber).padStart(2, '0')}
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          width: Math.round(contentWidth * 0.12),
          height: 2,
          backgroundColor: p.accent,
          marginBottom: 28,
        }}
      />

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontFamily: t.display_font,
          fontWeight: 700,
          fontSize: titleSize,
          color: p.text,
          lineHeight: 1.08,
          letterSpacing: '-0.015em',
          maxWidth: contentWidth,
          marginBottom: 28,
          flexWrap: 'wrap' as const,
        }}
      >
        {title}
      </div>

      {/* Body */}
      {body ? (
        <div
          style={{
            display: 'flex',
            fontFamily: t.body_font,
            fontSize: bodySize,
            color: p.muted,
            lineHeight: 1.6,
            maxWidth: Math.round(contentWidth * 0.9),
            flexWrap: 'wrap' as const,
          }}
        >
          {body}
        </div>
      ) : null}

      {/* Spacer */}
      <div style={{ display: 'flex', flex: 1 }} />

      {/* Footer paginação */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: contentWidth,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: monoSize,
            color: p.muted,
            letterSpacing: '0.04em',
          }}
        >
          {brandName}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: monoSize,
            color: p.muted,
          }}
        >
          {slideNumber}/{totalSlides}
        </div>
      </div>
    </div>
  );
}

// ─── CTA LAYOUT (slide final) ─────────────────────────────────────────────────

function CtaLayout({
  title,
  body,
  brandName,
  ctaText,
  priceMain,
  priceCompare,
  tokens,
  width,
  height,
  safeZone = { top: 80, right: 80, bottom: 80, left: 80 },
}: EditorialSlideProps) {
  const p = tokens.palette;
  const t = tokens.typography;
  const px = safeZone.left;
  const py = safeZone.top;
  const contentWidth = width - safeZone.left - safeZone.right;

  const contrast = contrastText(p.primary);
  const textColor = contrast === 'light' ? p.bg : p.text;
  const mutedColor = contrast === 'light'
    ? `${p.bg}cc` // 80% opacity aproximado
    : p.muted;

  const titleSize = Math.round(width * 0.068);
  const priceSize = Math.round(width * 0.095);
  const bodySize  = Math.round(width * 0.026);
  const monoSize  = Math.round(width * 0.018);
  const ctaSize   = Math.round(width * 0.030);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        backgroundColor: p.primary,
        padding: `${py}px ${px}px`,
      }}
    >
      {/* Linha accent topo */}
      <div
        style={{
          display: 'flex',
          width: Math.round(contentWidth * 0.2),
          height: 3,
          backgroundColor: p.accent,
          marginBottom: 40,
        }}
      />

      {/* Headline */}
      <div
        style={{
          display: 'flex',
          fontFamily: t.display_font,
          fontWeight: 800,
          fontSize: titleSize,
          color: textColor,
          lineHeight: 1.04,
          letterSpacing: '-0.02em',
          maxWidth: contentWidth,
          marginBottom: 36,
          flexWrap: 'wrap' as const,
        }}
      >
        {title}
      </div>

      {/* Preço (se fornecido) */}
      {priceMain ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: t.display_font,
              fontWeight: 800,
              fontSize: priceSize,
              color: p.accent,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {priceMain}
          </div>
          {priceCompare ? (
            <div
              style={{
                display: 'flex',
                fontFamily: t.body_font,
                fontSize: bodySize,
                color: mutedColor,
                marginTop: 8,
              }}
            >
              {priceCompare}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Body / CTA text */}
      {body ? (
        <div
          style={{
            display: 'flex',
            fontFamily: t.body_font,
            fontSize: bodySize,
            color: mutedColor,
            lineHeight: 1.55,
            maxWidth: Math.round(contentWidth * 0.85),
            flexWrap: 'wrap' as const,
            marginBottom: 24,
          }}
        >
          {body}
        </div>
      ) : null}

      {/* CTA pill */}
      {ctaText ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: ctaSize,
              color: p.accent,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            → {ctaText}
          </div>
        </div>
      ) : null}

      {/* Spacer */}
      <div style={{ display: 'flex', flex: 1 }} />

      {/* Footer brand */}
      <div
        style={{
          display: 'flex',
          fontFamily: 'JetBrains Mono',
          fontSize: monoSize,
          color: mutedColor,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}
      >
        {brandName}
      </div>
    </div>
  );
}
