import React from 'react';

export default function WorkshopCardsRow({ cards, onCardClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 16 }}>
      {cards.map((c) => (
        <button
          type="button"
          key={c.key}
          onClick={() => onCardClick?.(c.key)}
          style={{
            textAlign: 'left',
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 1px 3px rgba(15,23,42,.05), 0 4px 16px rgba(30,58,95,.06)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.9px', textTransform: 'uppercase', color: '#94A3B8' }}>
                {c.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 950, color: '#0F172A', marginTop: 6, letterSpacing: '-0.7px', lineHeight: 1 }}>
                {c.value}
              </div>
              {c.subtitle && (
                <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 750, marginTop: 6, lineHeight: 1.3 }}>{c.subtitle}</div>
              )}
            </div>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: `${c.accent}22`, border: `1px solid ${c.accent}66` }} />
          </div>
        </button>
      ))}
    </div>
  );
}

