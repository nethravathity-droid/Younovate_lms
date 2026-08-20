import React from 'react';

export default function LayoutShell({ children }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {children}
    </div>
  );
}

