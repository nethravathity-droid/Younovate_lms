import React from 'react';
import { youvaTheme } from './youvaTokens';

export default function LogoCarousel() {
  const logos = [
    'Stellar Institute',
    'NorthBridge University',
    'Aurum College of Tech',
    'Vantage Labs',
    'Crescent Corporate',
    'Nova Learning Partners',
    'Sapphire Education Group',
    'OrbitTech Solutions',
  ];

  return (
    <div style={{
      borderRadius: 22,
      background: '#FFFFFF',
      border: `1px solid ${youvaTheme.colors.borderSoft}`,
      padding: 16,
      overflow: 'hidden',
      boxShadow: '0 18px 50px rgba(30,58,138,0.06)',
    }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {logos.map((l, idx) => (
          <div
            key={l}
            style={{
              flex: '1 1 160px',
              minWidth: 160,
              borderRadius: 18,
              border: '1px solid rgba(219,227,237,0.9)',
              background: idx % 2 === 0 ? 'rgba(30,58,138,0.05)' : 'rgba(124,58,237,0.04)',
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 1000,
              color: youvaTheme.colors.text,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

