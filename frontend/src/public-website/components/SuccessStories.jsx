import React from 'react';
import { youvaTheme } from './youvaTokens';

export default function SuccessStories() {
  const stories = [
    {
      name: 'Aarav • Data Analyst',
      videoLabel: 'Video Testimonial',
      text:
        'I joined YIEP to move from “learning AI” to shipping real work. The assignments and weekly reviews turned my notes into a portfolio I could confidently show in interviews.',
    },
    {
      name: 'Meera • Team Lead',
      videoLabel: 'Video Testimonial',
      text:
        'YBLP helped me lead AI adoption in my team. The capstone made us present, execute, and learn together—without losing structure.',
    },
    {
      name: 'Zoya • Placement Track',
      videoLabel: 'Video Testimonial',
      text:
        'The placement support and interview roadmap were practical. I knew what to prepare, when to prepare it, and how to prove progress.',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16 }}>
      {stories.map((s) => (
        <div
          key={s.name}
          style={{
            borderRadius: 18,
            background: '#FFFFFF',
            border: `1px solid ${youvaTheme.colors.borderSoft}`,
            boxShadow: '0 18px 50px rgba(30,58,138,0.06)',
            padding: 16,
            minHeight: 250,
          }}
        >
          <div style={{
            height: 150,
            borderRadius: 16,
            background:
              'linear-gradient(135deg, rgba(30,58,138,0.08), rgba(63,125,160,0.14)), radial-gradient(circle at 20% 30%, rgba(124,58,237,0.18), transparent 45%)',
            border: '1px solid rgba(219,227,237,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(219,227,237,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 1000,
              color: youvaTheme.colors.text,
            }}>
              ▶
            </div>
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              fontSize: 12,
              fontWeight: 1000,
              color: youvaTheme.colors.muted,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(219,227,237,0.9)',
            }}>
              {s.videoLabel}
            </div>
          </div>
          <div style={{ marginTop: 14, fontWeight: 1000, color: youvaTheme.colors.text }}>{s.name}</div>
          <div style={{ marginTop: 10, color: youvaTheme.colors.muted, fontWeight: 800, lineHeight: 1.85 }}>
            {s.text}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Project Showcase', 'Career Growth', 'Certificate'].map((t) => (
              <span
                key={t}
                style={{
                  padding: '7px 10px',
                  borderRadius: 999,
                  background: 'rgba(30,58,138,0.06)',
                  border: '1px solid rgba(30,58,138,0.08)',
                  color: youvaTheme.colors.text,
                  fontWeight: 950,
                  fontSize: 12,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

