// Shared design tokens + atoms for Trainer Workshop pages
// Matches the existing Trainer Dashboard (Inter font, #111827 text, #6366f1 accent)
import React from 'react';

export const C = {
  bg:       '#f9fafb',
  white:    '#fff',
  border:   '#e5e7eb',
  text1:    '#111827',
  text2:    '#374151',
  text3:    '#6b7280',
  text4:    '#9ca3af',
  accent:   '#6366f1',
  accentBg: '#f5f3ff',
  accentBd: '#e0e7ff',
  green:    '#16a34a',
  greenBg:  '#dcfce7',
  red:      '#b91c1c',
  redBg:    '#fee2e2',
  yellow:   '#d97706',
  yellowBg: '#fef9c3',
  blue:     '#1d4ed8',
  blueBg:   '#dbeafe',
  dark:     '#1e293b',
};

export const S = {
  page:     { minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif", color: '#111827', padding: '32px 24px' },
  card:     { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' },
  cardSm:   { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' },
  th:       { padding: '10px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', whiteSpace: 'nowrap' },
  td:       { padding: '11px 12px', fontSize: '0.84rem', color: '#374151', borderBottom: '1px solid #f3f4f6' },
  input:    { width: '100%', boxSizing: 'border-box', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', fontFamily: 'inherit', color: '#111827', background: '#fff', outline: 'none' },
  btnPri:   { background: '#1e293b', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnSec:   { background: '#fff', color: '#6366f1', border: '1px solid #e0e7ff', padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnGhost: { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnGreen: { background: '#15803d', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnRed:   { background: '#dc2626', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 },
};

export const Pill = ({ children, bg = '#dcfce7', color = '#16a34a', dot = false }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color, fontSize: '0.71rem', fontWeight: 600, padding: '2px 9px', borderRadius: 99, whiteSpace: 'nowrap', lineHeight: 1.7 }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
    {children}
  </span>
);

export const Spinner = ({ pad = 40 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: pad }}>
    <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', animation: 'spin .7s linear infinite' }} />
  </div>
);

export const Empty = ({ icon = '📭', msg = 'No data found' }) => (
  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{msg}</div>
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: '0.84rem', color: '#6b7280', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {children && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>}
  </div>
);

export const KPICard = ({ title, value, icon, accent = '#6366f1', sub }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{title}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 16, color: accent }} />
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{sub}</div>}
  </div>
);

export const StatusBadge = ({ status }) => {
  const cfg = {
    Draft:     ['#e5e7eb', '#6b7280'],
    Published: ['#dbeafe', '#1d4ed8'],
    Live:      ['#fee2e2', '#b91c1c'],
    Completed: ['#dcfce7', '#16a34a'],
    Archived:  ['#f1f5f9', '#64748b'],
    Cancelled: ['#fee2e2', '#b91c1c'],
  };
  const [bg, color] = cfg[status] || ['#e5e7eb', '#6b7280'];
  return (
    <span style={{ background: bg, color, padding: '2px 9px', borderRadius: 99, fontSize: '0.71rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export const WorkshopSelector = ({ workshops, selectedId, onSelect }) => (
  <select
    value={selectedId || ''}
    onChange={e => onSelect(e.target.value)}
    style={{ boxSizing: 'border-box', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', fontFamily: 'inherit', color: '#111827', background: '#fff', outline: 'none', maxWidth: 320 }}
  >
    <option value="">Select workshop…</option>
    {workshops.map(w => (
      <option key={w._id} value={w._id}>{w.title}</option>
    ))}
  </select>
);
