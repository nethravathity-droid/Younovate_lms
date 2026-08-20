import React from 'react';
import { youvaTheme } from './youvaTokens';

export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          inset: -80,
          background:
            'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.16) 0%, transparent 45%), radial-gradient(circle at 75% 30%, rgba(124,58,237,0.14) 0%, transparent 50%), radial-gradient(circle at 50% 75%, rgba(6,182,212,0.10) 0%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(90deg, rgba(37,99,235,0.05), rgba(37,99,235,0.05) 1px, transparent 1px, transparent 12px)',
          opacity: 0.55,
          transform: 'translateZ(0)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.65) 100%)',
        }}
      />

      <style>{`
        @keyframes y-scan {
          0% { transform: translateY(-40%); opacity: 0.0; }
          15% { opacity: 0.35; }
          50% { opacity: 0.6; }
          100% { transform: translateY(40%); opacity: 0.0; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          left: '-20%',
          top: '10%',
          width: '140%',
          height: 120,
          background: `linear-gradient(180deg, transparent, ${youvaTheme.colors.brand2}55, transparent)`,
          filter: 'blur(10px)',
          animation: 'y-scan 3.4s ease-in-out infinite',
          opacity: 0.3,
        }}
      />
    </div>
  );
}

