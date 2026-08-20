import React, { useState, useRef } from 'react';

export default function FAQ({ items }) {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((it, idx) => {
        const open = idx === openIdx;
        return (
          <FAQItem
            key={it.q}
            item={it}
            open={open}
            onToggle={() => setOpenIdx(p => p === idx ? -1 : idx)}
          />
        );
      })}
    </div>
  );
}

function FAQItem({ item, open, onToggle }) {
  const bodyRef = useRef(null);

  return (
    <div style={{
      borderRadius: 16,
      background: open ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${open ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.07)'}`,
      overflow: 'hidden',
      transition: 'border-color 0.3s, background 0.3s',
      backdropFilter: 'blur(12px)',
    }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          padding: '16px 20px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 700, color: open ? '#F1F5F9' : '#CBD5E1', fontSize: 15, lineHeight: 1.4 }}>
          {item.q}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: open ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#60A5FA' : '#64748B',
          fontWeight: 700, fontSize: 18,
          transition: 'all 0.3s',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}>
          +
        </div>
      </button>
      <div style={{
        maxHeight: open ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
      }}>
        <div style={{ padding: '0 20px 18px', color: '#94A3B8', fontWeight: 500, lineHeight: 1.85, fontSize: 14 }}>
          {item.a}
        </div>
      </div>
    </div>
  );
}
