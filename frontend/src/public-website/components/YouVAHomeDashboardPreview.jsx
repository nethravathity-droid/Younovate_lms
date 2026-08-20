import React, { useEffect, useRef, useState } from 'react';

/* Floating tech chip labels */
const CHIPS = [
  { label: 'Python', icon: '🐍', x: '8%', y: '18%', delay: 0 },
  { label: 'React', icon: '⚛️', x: '78%', y: '12%', delay: 0.6 },
  { label: 'Node.js', icon: '🟢', x: '82%', y: '55%', delay: 1.2 },
  { label: 'MongoDB', icon: '🍃', x: '5%', y: '62%', delay: 0.9 },
  { label: 'ML Model', icon: '🧠', x: '72%', y: '78%', delay: 0.3 },
  { label: 'GitHub', icon: '🐙', x: '15%', y: '80%', delay: 1.5 },
  { label: 'Neural Net', icon: '🔗', x: '88%', y: '32%', delay: 0.4 },
  { label: 'Certificate', icon: '🏅', x: '2%', y: '40%', delay: 1.1 },
];

function FloatingChip({ label, icon, x, y, delay }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 999,
      background: 'rgba(30,41,59,0.85)',
      border: '1px solid rgba(37,99,235,0.3)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      fontSize: 12, fontWeight: 700, color: '#CBD5E1',
      whiteSpace: 'nowrap',
      animation: `chip-float 4s ease-in-out ${delay}s infinite`,
      zIndex: 2,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </div>
  );
}

/* SVG Robot */
function AIRobot() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Holographic base ring */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
        width: '55%', height: 24,
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.5) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(8px)',
        animation: 'holo-pulse 2.5s ease-in-out infinite',
      }} />

      {/* Robot SVG */}
      <svg
        viewBox="0 0 280 420"
        style={{
          width: '72%', maxWidth: 320,
          filter: 'drop-shadow(0 0 30px rgba(37,99,235,0.4))',
          animation: 'robot-float 3s ease-in-out infinite',
          position: 'relative', zIndex: 1,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Neck */}
        <rect x="122" y="118" width="36" height="22" rx="6" fill="#1E293B" stroke="rgba(37,99,235,0.4)" strokeWidth="1" />

        {/* Body */}
        <rect x="60" y="138" width="160" height="140" rx="20" fill="url(#bodyGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />

        {/* Body panel lines */}
        <line x1="80" y1="158" x2="200" y2="158" stroke="rgba(37,99,235,0.2)" strokeWidth="1" />
        <line x1="80" y1="248" x2="200" y2="248" stroke="rgba(37,99,235,0.2)" strokeWidth="1" />

        {/* Chest core — glowing circle */}
        <circle cx="140" cy="200" r="28" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5" />
        <circle cx="140" cy="200" r="18" fill="rgba(37,99,235,0.15)" stroke="rgba(6,182,212,0.6)" strokeWidth="1.5" filter="url(#glow)" />
        <circle cx="140" cy="200" r="9" fill="#2563EB" filter="url(#softGlow)">
          <animate attributeName="r" values="9;11;9" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Chest panel indicators */}
        {[0, 1, 2].map(i => (
          <rect key={i} x={90 + i * 22} y="168" width="14" height="6" rx="3"
            fill={i === 0 ? '#06B6D4' : i === 1 ? '#2563EB' : '#7C3AED'}
            opacity="0.8" filter="url(#glow)">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1.2 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
        ))}

        {/* Left arm */}
        <g style={{ transformOrigin: '72px 155px' }}>
          <animate attributeName="transform" values="rotate(0,72,155);rotate(-8,72,155);rotate(0,72,155)" dur="3s" repeatCount="indefinite" />
          <rect x="30" y="145" width="34" height="90" rx="14" fill="url(#bodyGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
          <rect x="34" y="220" width="26" height="28" rx="10" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />
          {/* Hand fingers */}
          {[0,1,2].map(i => (
            <rect key={i} x={36 + i * 8} y="244" width="5" height="14" rx="3" fill="#1E3A8A" stroke="rgba(37,99,235,0.3)" strokeWidth="0.5" />
          ))}
        </g>

        {/* Right arm */}
        <g style={{ transformOrigin: '208px 155px' }}>
          <animate attributeName="transform" values="rotate(0,208,155);rotate(8,208,155);rotate(0,208,155)" dur="3s" begin="1.5s" repeatCount="indefinite" />
          <rect x="216" y="145" width="34" height="90" rx="14" fill="url(#bodyGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
          <rect x="220" y="220" width="26" height="28" rx="10" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />
          {[0,1,2].map(i => (
            <rect key={i} x={222 + i * 8} y="244" width="5" height="14" rx="3" fill="#1E3A8A" stroke="rgba(37,99,235,0.3)" strokeWidth="0.5" />
          ))}
        </g>

        {/* Legs */}
        <rect x="90" y="276" width="38" height="80" rx="14" fill="url(#bodyGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
        <rect x="152" y="276" width="38" height="80" rx="14" fill="url(#bodyGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
        {/* Feet */}
        <rect x="82" y="348" width="52" height="22" rx="10" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />
        <rect x="146" y="348" width="52" height="22" rx="10" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />

        {/* HEAD — animated turn */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            values="0 140 80; 4 140 80; 0 140 80; -4 140 80; 0 140 80"
            dur="6s" repeatCount="indefinite" />

          {/* Head shape */}
          <rect x="82" y="28" width="116" height="92" rx="22" fill="url(#headGrad)" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5" />

          {/* Antenna */}
          <line x1="140" y1="28" x2="140" y2="10" stroke="rgba(37,99,235,0.6)" strokeWidth="2" />
          <circle cx="140" cy="8" r="5" fill="#06B6D4" filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Visor */}
          <rect x="92" y="44" width="96" height="36" rx="12" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />

          {/* Eyes */}
          <ellipse cx="118" cy="62" rx="14" ry="10" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
          <ellipse cx="162" cy="62" rx="14" ry="10" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />

          {/* Eye pupils — blink */}
          <ellipse cx="118" cy="62" rx="7" ry="7" fill="#06B6D4" filter="url(#glow)">
            <animate attributeName="ry" values="7;7;7;0.5;7;7" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="162" cy="62" rx="7" ry="7" fill="#06B6D4" filter="url(#glow)">
            <animate attributeName="ry" values="7;7;7;0.5;7;7" dur="4s" begin="0.1s" repeatCount="indefinite" />
          </ellipse>

          {/* Eye inner glow */}
          <circle cx="118" cy="62" r="3" fill="#fff" opacity="0.8" />
          <circle cx="162" cy="62" r="3" fill="#fff" opacity="0.8" />

          {/* Mouth / speaker grille */}
          {[0,1,2,3,4].map(i => (
            <rect key={i} x={104 + i * 16} y="96" width="8" height="3" rx="1.5"
              fill="rgba(37,99,235,0.6)" filter="url(#glow)">
              <animate attributeName="height" values="3;6;3" dur={`${0.6 + i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}

          {/* Head side panels */}
          <rect x="82" y="50" width="10" height="30" rx="4" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />
          <rect x="188" y="50" width="10" height="30" rx="4" fill="#1E293B" stroke="rgba(37,99,235,0.3)" strokeWidth="1" />
        </g>

        {/* Holographic screen the robot is "teaching" */}
        <g transform="translate(0, -10)">
          <rect x="155" y="155" width="90" height="60" rx="8"
            fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.3)" strokeWidth="1"
            strokeDasharray="4 2">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </rect>
          {/* Code lines on screen */}
          {[0,1,2,3].map(i => (
            <rect key={i} x={162} y={165 + i * 11} width={i % 2 === 0 ? 60 : 40} height="4" rx="2"
              fill={i === 0 ? 'rgba(6,182,212,0.7)' : 'rgba(37,99,235,0.5)'}>
              <animate attributeName="width" values={`${i % 2 === 0 ? 60 : 40};${i % 2 === 0 ? 40 : 60};${i % 2 === 0 ? 60 : 40}`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
      </svg>

      {/* Orbit ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%', height: '85%',
        border: '1px solid rgba(37,99,235,0.12)',
        borderRadius: '50%',
        animation: 'orbit-spin 20s linear infinite',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: -5, left: '50%',
          width: 10, height: 10, borderRadius: '50%',
          background: '#2563EB',
          boxShadow: '0 0 12px rgba(37,99,235,0.8)',
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Second orbit ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(60deg)',
        width: '70%', height: '70%',
        border: '1px solid rgba(124,58,237,0.1)',
        borderRadius: '50%',
        animation: 'orbit-spin-rev 15s linear infinite',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: -4, left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          background: '#7C3AED',
          boxShadow: '0 0 10px rgba(124,58,237,0.8)',
          transform: 'translateX(-50%)',
        }} />
      </div>
    </div>
  );
}

export default function YouVAHomeDashboardPreview() {
  return (
    <div style={{
      flex: '1 1 480px', minWidth: 320, maxWidth: 560,
      position: 'relative', height: 520,
    }}>
      <style>{ANIM_CSS}</style>

      {/* Floating chips */}
      {CHIPS.map(c => <FloatingChip key={c.label} {...c} />)}

      {/* Robot */}
      <AIRobot />

      {/* AI Status card */}
      <div style={{
        position: 'absolute', bottom: '6%', right: '4%',
        background: 'rgba(30,41,59,0.9)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 14, padding: '10px 14px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'chip-float 3.5s ease-in-out 0.5s infinite',
        zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>AI Tutor</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>Online</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>
          Teaching: Neural Networks
        </div>
        <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 3, height: 12 + Math.sin(i) * 6, borderRadius: 2,
              background: '#2563EB',
              animation: `bar-wave ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      {/* Students count card */}
      <div style={{
        position: 'absolute', top: '8%', left: '4%',
        background: 'rgba(30,41,59,0.9)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 14, padding: '10px 14px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'chip-float 4s ease-in-out 1s infinite',
        zIndex: 3,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Session</div>
        <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: '#F1F5F9' }}>247 <span style={{ fontSize: 13, color: '#7C3AED' }}>students</span></div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#64748B' }}>YIEP Batch 12 • Active</div>
      </div>
    </div>
  );
}

const ANIM_CSS = `
  @keyframes chip-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes robot-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-16px); }
  }
  @keyframes holo-pulse {
    0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
    50% { opacity: 1; transform: translateX(-50%) scaleX(1.1); }
  }
  @keyframes orbit-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes orbit-spin-rev {
    from { transform: translate(-50%, -50%) rotate(60deg); }
    to { transform: translate(-50%, -50%) rotate(-300deg); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }
  @keyframes bar-wave {
    from { transform: scaleY(0.5); }
    to { transform: scaleY(1.5); }
  }
`;
