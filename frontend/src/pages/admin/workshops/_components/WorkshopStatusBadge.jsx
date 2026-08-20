import React from 'react';
import { WORKSHOP_TEXT } from './workshopDesignTokens';

function normalizeStatus(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('completed')) return 'completed';
  if (s.includes('upcoming')) return 'upcoming';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('draft')) return 'draft';
  if (s.includes('archive')) return 'archived';
  return 'draft';
}

const cfg = (norm) => {
  switch (norm) {
    case 'completed':
      return { bg: '#16a05f', fg: '#fff' };
    case 'upcoming':
      return { bg: '#2f6f9b', fg: '#fff' };
    case 'cancelled':
      return { bg: '#c0392b', fg: '#fff' };
    case 'archived':
      return { bg: '#657691', fg: '#fff' };
    default:
      return { bg: '#f59e0b', fg: '#111827' };
  }
};

export default function WorkshopStatusBadge({ status }) {
  const norm = normalizeStatus(status);
  const c = cfg(norm);

  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: '4px 10px',
        borderRadius: 999,
        fontWeight: 900,
        fontSize: 11,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
      title={String(status || '')}
    >
      {norm}
    </span>
  );
}

