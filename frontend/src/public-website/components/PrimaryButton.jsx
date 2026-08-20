import React, { useRef } from 'react';

export default function PrimaryButton({ children, onClick, style, type = 'button' }) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);animation:ripple-anim 0.5s ease-out forwards;
      pointer-events:none;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick?.(e);
  };

  return (
    <>
      <style>{`
        @keyframes ripple-anim { to { transform: scale(2.5); opacity: 0; } }
        .ypbtn { position:relative; overflow:hidden; }
        .ypbtn:hover { transform:translateY(-2px) scale(1.04); box-shadow:0 0 35px rgba(37,99,235,.45) !important; }
        .ypbtn:active { transform:translateY(0) scale(1.00); }
      `}</style>
      <button
        ref={btnRef}
        type={type}
        className="ypbtn"
        onClick={handleClick}
        style={{
          padding: '13px 28px',
          borderRadius: 18,
          border: 'none',
          cursor: 'pointer',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: 15,
          background: 'linear-gradient(90deg, #2563EB, #4F8CFF)',
          boxShadow: '0 0 35px rgba(37,99,235,.45)',
          transition: 'transform 300ms ease, box-shadow 300ms ease',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          ...style,
        }}
      >
        {children}
      </button>
    </>
  );
}
