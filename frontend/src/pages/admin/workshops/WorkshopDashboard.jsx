import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorkshopStats,
  fetchAdminWorkshops,
  fetchWorkshopRegistrations,
  selectWorkshopStats,
  selectWorkshopStatsStatus,
  selectAdminWorkshops,
  selectWsRegistrations,
} from '../../../features/workshops/workshopSlice';

const S = {
  page:    { padding: '20px 28px', fontFamily: 'Public Sans, system-ui, sans-serif', background: '#F1F5F9', minHeight: '100vh' },
  card:    { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 3px rgba(15,23,42,.05),0 4px 16px rgba(30,58,95,.06)' },
  label:   { fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#94A3B8' },
  val:     { fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.5px' },
  sub:     { fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 6 },
  panelHd: { padding: '18px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' },
  th:      { padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: '#94A3B8', background: '#F8FAFC', textAlign: 'left', whiteSpace: 'nowrap' },
  td:      { padding: '11px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' },
};

function KPICard({ title, value, sub, icon, accent }) {
  return (
    <div style={{ ...S.card, padding: 18 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 18, color: accent }} />
      </div>
      <div style={S.label}>{title}</div>
      <div style={{ ...S.val, marginTop: 6 }}>{value ?? '—'}</div>
      {sub && <div style={S.sub}>{sub}</div>}
    </div>
  );
}

function RegStatusBadge({ status }) {
  const cfg = {
    Registered: ['#DBEAFE','#1E40AF'],
    Approved:   ['#D1FAE5','#065F46'],
    Rejected:   ['#FEE2E2','#991B1B'],
    Cancelled:  ['#F1F5F9','#475569'],
  };
  const [bg, fg] = cfg[status] || cfg.Registered;
  return (
    <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

const fmt = (d) => {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' }); }
  catch { return '—'; }
};

export default function WorkshopDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const stats = useSelector(selectWorkshopStats);
  const statsStatus = useSelector(selectWorkshopStatsStatus);
  const workshops = useSelector(selectAdminWorkshops);
  const registrations = useSelector(selectWsRegistrations);

  useEffect(() => {
    dispatch(fetchWorkshopStats());
    dispatch(fetchAdminWorkshops({ limit: 10 }));
    dispatch(fetchWorkshopRegistrations({ limit: 5 }));
  }, [dispatch]);

  const upcomingList = workshops.filter(w => ['Published', 'upcoming'].includes(w.status)).slice(0, 5);
  const latestRegs = registrations.slice(0, 5);

  const kpis = [
    { title: 'Total Workshops',   value: stats?.total,      sub: 'All time',           icon: 'writing',        accent: '#6366F1' },
    { title: 'Published',         value: stats?.published,  sub: 'Live on landing page',icon: 'eye',           accent: '#0EA5E9' },
    { title: 'Upcoming',          value: stats?.upcoming,   sub: 'Scheduled',          icon: 'calendar-event', accent: '#10B981' },
    { title: 'Completed',         value: stats?.completed,  sub: 'Finished sessions',  icon: 'circle-check',   accent: '#22C55E' },
    { title: 'Draft',             value: stats?.draft,      sub: 'Not published',      icon: 'file',           accent: '#F59E0B' },
    { title: 'Registrations',     value: stats?.totalRegs,  sub: 'Total enrolled',     icon: 'clipboard-list', accent: '#3B82F6' },
    { title: 'Available Seats',   value: stats?.availableSeats, sub: 'Across all workshops', icon: 'armchair', accent: '#8B5CF6' },
    { title: 'Registration %',    value: stats?.regPct != null ? `${stats.regPct}%` : '—', sub: 'Fill rate', icon: 'chart-bar', accent: '#F97316' },
  ];

  return (
    <div style={S.page}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1E3A5F 0%,#1a2f52 55%,#231a4a 100%)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Workshop Management · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px', lineHeight: 1.2 }}>
            Workshop Overview
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', maxWidth: 460 }}>
            {stats?.total ?? 0} workshops · {stats?.upcoming ?? 0} upcoming · {stats?.totalRegs ?? 0} registrations
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Create Workshop',    icon: 'plus',           action: () => navigate('/admin/workshops/management') },
              { label: 'View Registrations', icon: 'clipboard-list', action: () => navigate('/admin/workshops/registrations') },
              { label: 'Workshop Reports',   icon: 'file-analytics', action: () => navigate('/admin/workshops/reports') },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <i className={`ti ti-${btn.icon}`} style={{ fontSize: 14 }} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      {statsStatus === 'loading' ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#94A3B8' }}>Loading statistics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {kpis.map(k => <KPICard key={k.title} {...k} />)}
        </div>
      )}

      {/* Upcoming Workshops + Latest Registrations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Upcoming Workshops */}
        <div style={S.card}>
          <div style={S.panelHd}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Upcoming Workshops</span>
            <button onClick={() => navigate('/admin/workshops/management')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Workshop', 'Date', 'Mode', 'Seats'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {upcomingList.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#94A3B8', padding: 24 }}>No upcoming workshops. Create one!</td></tr>
                ) : upcomingList.map(w => (
                  <tr key={w._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/workshops/management')}>
                    <td style={S.td}><span style={{ fontWeight: 700, color: '#0F172A' }}>{w.title}</span></td>
                    <td style={S.td}>{fmt(w.date || w.startDate)}</td>
                    <td style={S.td}>{w.mode || 'Online'}</td>
                    <td style={S.td}>{w.registrationCount || 0}/{w.maxSeats || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Registrations */}
        <div style={S.card}>
          <div style={S.panelHd}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Latest Registrations</span>
            <button onClick={() => navigate('/admin/workshops/management')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Student', 'Workshop', 'Status', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {latestRegs.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#94A3B8', padding: 24 }}>No registrations yet.</td></tr>
                ) : latestRegs.map(r => (
                  <tr key={r._id}>
                    <td style={S.td}>
                      <span style={{ fontWeight: 700 }}>{r.fullName}</span>
                      <br /><span style={{ fontSize: 11, color: '#94A3B8' }}>{r.college || r.email}</span>
                    </td>
                    <td style={S.td}>{r.workshopName || r.workshopId?.title || '—'}</td>
                    <td style={S.td}><RegStatusBadge status={r.registrationStatus} /></td>
                    <td style={S.td}>{fmt(r.registrationDate || r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
