import React, { useState } from 'react';
import { useScrollReveal } from './SectionShell';

const KIND_COLORS = {
  accent: { bg: 'rgba(37,99,235,0.08)', border: 'rgba(124,58,237,0.25)', color: '#A78BFA' },
  teal:   { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)',  color: '#22D3EE' },
  brand:  { bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.25)',  color: '#60A5FA' },
};

function WhyCard({ it, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useScrollReveal(0.1);
  const c = KIND_COLORS[it.kind] || KIND_COLORS.brand;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? c.border : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        padding: 20,
        transform: hovered ? 'translateY(-6px) scale(1.02)' : visible ? 'translateY(0)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: `opacity 0.6s ease ${delay}s, transform 0.3s ease`,
        backdropFilter: 'blur(12px)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${c.bg.replace('0.12', '0.18')}, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 14,
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
      }}>
        {it.icon}
      </div>
      <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 15, lineHeight: 1.3 }}>{it.title}</div>
      <div style={{ marginTop: 8, color: '#94A3B8', fontWeight: 500, lineHeight: 1.7, fontSize: 13 }}>
        {it.description}
      </div>
    </div>
  );
}

export default function WhyCards({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
      {items.map((it, i) => <WhyCard key={it.title} it={it} delay={i * 0.07} />)}
    </div>
  );
}
