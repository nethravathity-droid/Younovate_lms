import React from 'react';
import { motion } from 'framer-motion';

import { youvaTheme } from './youvaTokens';

const POS = [
  { x: '-34%', y: '0%', r: '-6deg' },
  { x: '22%', y: '-26%', r: '7deg' },
  { x: '38%', y: '20%', r: '-10deg' },
  { x: '-14%', y: '34%', r: '12deg' },
  { x: '-46%', y: '26%', r: '-14deg' },
];

export default function FloatingAICards({ cards }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {cards.map((c, i) => {
        const p = POS[i % POS.length];
        return (
          <motion.div
            key={c.title}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${p.x}, ${p.y}) rotate(${p.r})`,
              width: 180,
              maxWidth: '44vw',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: c.delay, ease: 'easeOut' }}
            whileHover={{
              y: -4,
              boxShadow: `0 18px 50px rgba(0,0,0,0.35), 0 0 40px ${c.color}33`,
            }}
            aria-hidden
          >
            <div
              style={{
                borderRadius: 16,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid rgba(255,255,255,0.10)`,
                backdropFilter: 'blur(14px)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: -40,
                  background: `radial-gradient(circle at 20% 20%, ${c.color}33 0%, transparent 45%), radial-gradient(circle at 80% 60%, ${youvaTheme.colors.accent}22 0%, transparent 55%)`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${c.color}33, rgba(255,255,255,0.04))`,
                    border: `1px solid ${c.color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 30px ${c.color}22`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{c.icon}</span>
                </div>

                <div>
                  <div style={{ fontWeight: 1000, color: youvaTheme.colors.text, fontSize: 13, lineHeight: 1.1 }}>{c.title}</div>
                  <div style={{ color: youvaTheme.colors.muted, fontWeight: 800, fontSize: 12, marginTop: 4 }}>{c.sub}</div>
                </div>
              </div>

              <div style={{ position: 'relative', marginTop: 10, display: 'flex', gap: 6 }}>
                {[0, 1, 2, 3].map((k) => (
                  <motion.div
                    key={k}
                    style={{
                      width: 10,
                      height: 2,
                      borderRadius: 999,
                      background: k % 2 === 0 ? c.color : youvaTheme.colors.cyan,
                      opacity: 0.85,
                    }}
                    animate={{
                      y: [0, -4, 0],
                      opacity: [0.4, 0.95, 0.4],
                    }}
                    transition={{ duration: 1.7 + k * 0.15, repeat: Infinity, ease: 'easeInOut', delay: k * 0.08 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

