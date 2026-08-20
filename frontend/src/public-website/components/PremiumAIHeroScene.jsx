import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { youvaTheme } from './youvaTokens';
import FloatingAICards from './FloatingAICards';
import AnimatedBackground from './AnimatedBackground';
import AIStatsCounter from './AIStatsCounter';
import HeroParticles from './HeroParticles';
import RobotTeacherSVG from './RobotTeacherSVG';

function useMouseParallax(max = 12) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setP({
          x: Math.max(-1, Math.min(1, dx)) * max,
          y: Math.max(-1, Math.min(1, dy)) * max,
        });
      });
    };

    const onLeave = () => setP({ x: 0, y: 0 });

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [max, reduced]);

  return { ref, parallax: p };
}

export default function PremiumAIHeroScene() {
  const { ref, parallax } = useMouseParallax(10);

  const cards = useMemo(
    () => [
      { title: 'AI Programs', sub: 'YIEP • YBLP', icon: '🧠', color: youvaTheme.colors.brand2, delay: 0.0 },
      { title: 'Live Workshops', sub: '90-min sessions', icon: '🎥', color: youvaTheme.colors.cyan, delay: 0.15 },
      { title: 'Certificates', sub: 'Completion proof', icon: '🏅', color: youvaTheme.colors.accent, delay: 0.3 },
      { title: 'Projects', sub: 'Build & ship', icon: '🧩', color: youvaTheme.colors.brand2, delay: 0.45 },
      { title: 'Placements', sub: 'Career roadmap', icon: '🎯', color: youvaTheme.colors.accent, delay: 0.6 },
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: 'Students', value: 5000, suffix: '+', color: youvaTheme.colors.brand2 },
      { label: 'Workshops', value: 150, suffix: '+', color: youvaTheme.colors.cyan },
      { label: 'Projects', value: 100, suffix: '+', color: youvaTheme.colors.accent },
    ],
    []
  );

  return (
    <div ref={ref} style={{ flex: '1 1 520px', minWidth: 320, maxWidth: 560, position: 'relative', height: 520 }}>
      {/* Background layers */}
      <AnimatedBackground />
      <HeroParticles />

      <motion.div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Scene depth wrapper */}
      <motion.div
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        animate={{
          rotateX: parallax.y * -0.35,
          rotateY: parallax.x * 0.35,
        }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      >
        {/* Orbit rings */}
        <div
          style={{
            position: 'absolute',
            width: '88%',
            height: '88%',
            borderRadius: '50%',
            border: `1px solid rgba(37,99,235,0.16)`,
            boxShadow: `0 0 60px rgba(37,99,235,0.12)`,
            animation: 'y-ai-orbit 18s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '72%',
            height: '72%',
            borderRadius: '50%',
            border: `1px solid rgba(37,99,235,0.08)`,
            transform: 'rotate(60deg)',
            animation: 'y-ai-orbit-rev 14s linear infinite',
          }}
        />

        {/* Robot teacher + board */}
        <motion.div
          style={{ width: '92%', height: '92%', position: 'relative' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RobotTeacherSVG />
        </motion.div>

        {/* Floating AI cards */}
        <FloatingAICards cards={cards} />

        {/* Counters (small) */}
        <div style={{ position: 'absolute', left: 10, top: 16, right: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {stats.map((s, idx) => (
            <AIStatsCounter key={s.label} {...s} index={idx} />
          ))}
        </div>

        {/* Central neural lines glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 45%, rgba(37,99,235,0.20) 0%, rgba(37,99,235,0.08) 22%, rgba(124,58,237,0.05) 50%, transparent 70%)',
            filter: 'blur(0px)',
          }}
        />
      </motion.div>

      <style>{`
        @keyframes y-ai-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes y-ai-orbit-rev { from { transform: rotate(60deg); } to { transform: rotate(-300deg); } }
        @media (max-width: 700px) {
          .yHeroHideOnMobile { display:none; }
        }
      `}</style>
    </div>
  );
}

