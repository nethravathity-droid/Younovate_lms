import React from 'react';

export default function WorkshopSearch({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '9px 11px',
        borderRadius: 10,
        border: '1px solid #dbe3ed',
        fontSize: 13,
        fontFamily: 'inherit',
        color: '#172033',
        background: '#fff',
      }}
    />
  );
}

