import React from 'react';
import { youvaTheme } from './youvaTokens';

export default function AboutTeamGrid() {
  const team = [
    { name: 'Learning Design', role: 'Program Curriculum & Assessments' },
    { name: 'AI Mentors', role: 'Weekly Reviews & Feedback' },
    { name: 'Workshop Trainers', role: 'Live Demos & Real Tooling' },
    { name: 'Career Support', role: 'Roadmap & Interview Prep' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }}>
      {team.map((t) => (
        <div
          key={t.name}
          style={{
            borderRadius: 18,
            background: '#FFFFFF',
            border: `1px solid ${youvaTheme.colors.borderSoft}`,
            boxShadow: '0 18px 50px rgba(30,58,138,0.06)',
            padding: 16,
            minHeight: 110,
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(30,58,138,0.08), rgba(63,125,160,0.14))',
            border: '1px solid rgba(219,227,237,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 1000,
            color: youvaTheme.colors.text,
          }}>
            ✦
          </div>
          <div style={{ marginTop: 12, fontWeight: 1000, color: youvaTheme.colors.text }}>{t.name}</div>
          <div style={{ marginTop: 8, color: youvaTheme.colors.muted, fontWeight: 800, lineHeight: 1.7, fontSize: 13 }}>{t.role}</div>
        </div>
      ))}
    </div>
  );
}

