import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { youvaTheme } from './youvaTokens';

function useCountUp(target, ms, enabled) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, enabled]);

  return value;
}

export default function AIStatsCounter({ label, value, suffix = '', color = youvaTheme.colors.brand2, index = 0 }) {
  const reduced = useReducedMotion();
  const count = useCountUp(value, 1100 + index * 120, !reduced);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.12, ease: 'easeOut' }}
      style={{
        flex: '0 1 auto',
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(15,23,42,0.62)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        zIndex: 3,
      }}
      aria-hidden
    >
      <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: youvaTheme.colors.muted }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontWeight: 1000, color: youvaTheme.colors.text, fontSize: 18, lineHeight: 1.1 }}>
        {count}
        <span style={{ fontSize: 13, color, fontWeight: 1000, marginLeft: 3 }}>{suffix}</span>
      </div>
    </motion.div>
  );
}

