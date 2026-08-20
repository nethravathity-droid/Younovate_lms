import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const items = [
  { to: '/admin/workshops/all', label: 'All Workshops' },
  { to: '/admin/workshops/drafts', label: 'Draft' },
  { to: '/admin/workshops/upcoming', label: 'Upcoming' },
  { to: '/admin/workshops/completed', label: 'Completed' },
];

export default function WorkshopManagementLayout() {
  return (
    <div style={{ padding: '0 24px 30px', background: '#f1f5f9' }}>
      <div style={subnavWrap}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            style={({ isActive }) => ({
              ...subnavLink,
              background: isActive ? '#2f6f9b' : 'transparent',
              color: isActive ? '#fff' : '#41506a',
              border: isActive ? '1px solid #2f6f9b' : '1px solid #dbe3ed',
            })}
          >
            {it.label}
          </NavLink>
        ))}
      </div>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

const subnavWrap = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  padding: '14px 0 0',
};

const subnavLink = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #dbe3ed',
  background: 'transparent',
  fontWeight: 950,
  color: '#41506a',
  textDecoration: 'none',
  fontFamily: 'Public Sans, system-ui, sans-serif',
  fontSize: 13.5,
};

