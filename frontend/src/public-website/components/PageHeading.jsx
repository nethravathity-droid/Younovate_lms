import React from 'react';
import { useScrollReveal } from './SectionShell';

export default function PageHeading({ eyebrow, title, description, rightBadge = null }) {
  const [ref, visible] = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 24,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: '28px 24px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(30,58,138,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {eyebrow && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(37,99,235,0.10)',
              border: '1px solid rgba(37,99,235,0.20)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              color: '#1E3A8A', textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              {eyebrow}
            </div>
          )}
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {description && (
            <p style={{ marginTop: 14, color: '#475569', fontWeight: 500, lineHeight: 1.8, fontSize: 16, maxWidth: 680 }}>
              {description}
            </p>
          )}
        </div>
        {rightBadge || (
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(30,58,138,0.10))',
            border: '1px solid rgba(37,99,235,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>🤖</div>
        )}
      </div>
    </div>
  );
}
