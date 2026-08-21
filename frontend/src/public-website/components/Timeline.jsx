import React from 'react';
import { useScrollReveal } from './SectionShell';

export default function Timeline({ steps }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Connecting line */}
      <div style={{
        position: 'absolute', top: 28, left: 28, right: 28, height: 1,
        background: 'linear-gradient(90deg, rgba(37,99,235,0.6), rgba(124,58,237,0.6), rgba(6,182,212,0.6))',
        zIndex: 0,
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))`,
        gap: 10, position: 'relative', zIndex: 1,
      }}>
        {steps.map((s, idx) => (
          <TimelineStep key={s.title} step={s} idx={idx} total={steps.length} />
        ))}
      </div>
    </div>
  );
}

function TimelineStep({ step, idx, total }) {
  const [ref, visible] = useScrollReveal(0.1);
  const colors = ['#2563EB', '#3B82F6', '#7C3AED', '#8B5CF6', '#06B6D4', '#0891B2'];
  const color = colors[idx % colors.length];

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`,
      }}
    >
      {/* Node */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 20px ${color}50`,
        marginBottom: 14, position: 'relative',
        zIndex: 1, background: '#0F172A',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 13,
          boxShadow: `0 0 12px ${color}80`,
        }}>
          {idx + 1}
        </div>
      </div>

      {/* Content */}
      <div style={{
        borderRadius: 16, padding: '12px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(12px)',
        textAlign: 'center', width: '100%',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {step.label}
        </div>
        <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 13, lineHeight: 1.3 }}>
          {step.title}
        </div>
      </div>
    </div>
  );
}
