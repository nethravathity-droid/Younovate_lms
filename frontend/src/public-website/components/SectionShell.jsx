import React, { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.15) {

  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function SectionShell({
  children,
  paddingY = 64,
  paddingTop = null,
  paddingBottom = null,
  maxWidth = 1200,
  id,
  reveal = true,
  tone = 'primary', // 'primary' | 'secondary' | 'alt'
}) {
  const pt = paddingTop ?? paddingY;
  const pb = paddingBottom ?? 20;
  const [ref, visible] = useScrollReveal();

  const background =
    tone === 'secondary'
      ? '#EEF4FF'
      : tone === 'alt'
      ? '#F1F5F9'
      : '#F8FAFC';

  return (
    <section
      id={id}
      ref={reveal ? ref : undefined}
      style={{
        padding: `${pt}px 0 ${pb}px`,
        background,
        opacity: reveal ? (visible ? 1 : 0) : 1,
        transform: reveal ? (visible ? 'translateY(0)' : 'translateY(32px)') : 'none',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth, margin: '0 auto', padding: '0 16px' }}>{children}</div>
    </section>
  );
}

export function Panel({
  children,
  padding = 18,
  style,
  radius,
  background,
  dark = true,
  hoverable = true,
}) {
  return (
    <div
      style={{
        borderRadius: radius ?? 22,
        background: background ?? '#FFFFFF',
        border: `1px solid #E2E8F0`,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(30,58,138,0.08)',
        padding,
        transition: hoverable ? 'transform 250ms ease, box-shadow 250ms ease' : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hoverable) return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.10), 0 16px 40px rgba(30,58,138,0.12)';
      }}
      onMouseLeave={(e) => {
        if (!hoverable) return;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(30,58,138,0.08)';
      }}
    >
      {children}
    </div>
  );
}

