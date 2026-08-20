import React, { useEffect, useRef } from 'react';
import { youvaTheme } from './youvaTokens';

export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0;
    let H = 0;
    let raf = 0;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rand = (a, b) => a + Math.random() * (b - a);

    const init = () => {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;

      const N = reduce ? 28 : 60;
      const particles = Array.from({ length: N }, () => ({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.22, 0.22),
        vy: rand(-0.22, 0.22),
        r: rand(0.8, 2.2),
        a: rand(0.18, 0.42),
      }));

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(37,99,235,${p.a})`;
          ctx.fill();
        }

        // Connect lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const alpha = (1 - dist / 120) * 0.18;
              ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        raf = requestAnimationFrame(draw);
      };

      draw();
      return particles;
    };

    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      init();
    });

    ro.observe(canvas);

    init();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75,
      }}
      aria-hidden
    />
  );
}

