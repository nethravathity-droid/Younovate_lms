import React from 'react';

export default function OutlineButton({ children, onClick, style, type = 'button' }) {
  return (
    <>
      <style>{`
        .yobtn:hover { background:rgba(255,255,255,0.06) !important; border-color:rgba(255,255,255,0.25) !important; transform:translateY(-2px); }
        .yobtn:active { transform:translateY(0); }
      `}</style>
      <button
        type={type}
        className="yobtn"
        onClick={onClick}
        style={{
          padding: '13px 28px',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,.12)',
          cursor: 'pointer',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: 15,
          background: 'transparent',
          backdropFilter: 'blur(12px)',
          transition: '300ms ease',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          ...style,
        }}
      >
        {children}
      </button>
    </>
  );
}
