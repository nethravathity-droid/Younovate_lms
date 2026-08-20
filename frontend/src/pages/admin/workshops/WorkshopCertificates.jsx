import React, { useState, useMemo } from 'react';
import { WORKSHOPS_MOCK, WORKSHOP_REGISTRATIONS_MOCK, formatDateTime } from './workshopMockData';

const S = {
  page:    { padding: '20px 28px', fontFamily: 'Public Sans, system-ui, sans-serif', background: '#F1F5F9', minHeight: '100vh' },
  card:    { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 3px rgba(15,23,42,.05),0 4px 16px rgba(30,58,95,.06)' },
  input:   { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', color: '#0F172A', background: '#fff', outline: 'none' },
  panelHd: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' },
  th:      { padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: '#94A3B8', background: '#F8FAFC', textAlign: 'left', whiteSpace: 'nowrap' },
  td:      { padding: '11px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' },
  btnPri:  { background: '#1E3A5F', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  btnGhost:{ background: '#fff', color: '#475569', border: '1px solid #E2E8F0', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  pill:    { fontSize: 11, color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '3px 10px', fontWeight: 600 },
};

// Enrich registrations with certificate data
const CERT_DATA = WORKSHOP_REGISTRATIONS_MOCK.map((r, i) => {
  const ws = WORKSHOPS_MOCK.find(w => w.id === r.workshopId);
  return {
    ...r,
    workshopName: ws?.name || '—',
    certId: r.certificateEligible ? `CERT-${ws?.id?.toUpperCase()}-${String(i + 1).padStart(3, '0')}` : null,
    issuedDate: r.certificateEligible ? new Date(Date.now() - 86400000 * (i + 1)).toISOString() : null,
    downloaded: r.certificateEligible && i % 2 === 0,
    emailSent:  r.certificateEligible && i % 3 === 0,
  };
});

function KPICard({ title, value, icon, accent, sub }) {
  return (
    <div style={{ ...S.card, padding: 18 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 18, color: accent }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#94A3B8' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function WorkshopCertificates() {
  const [search,    setSearch]    = useState('');
  const [fWorkshop, setFWorkshop] = useState('all');
  const [fStatus,   setFStatus]   = useState('all');

  const issued     = CERT_DATA.filter(r => r.certificateEligible).length;
  const pending    = CERT_DATA.filter(r => !r.certificateEligible).length;
  const downloaded = CERT_DATA.filter(r => r.downloaded).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CERT_DATA.filter(r =>
      (!q || r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.certId || '').toLowerCase().includes(q)) &&
      (fWorkshop === 'all' || r.workshopId === fWorkshop) &&
      (fStatus === 'all' ||
        (fStatus === 'issued'  && r.certificateEligible) ||
        (fStatus === 'pending' && !r.certificateEligible))
    );
  }, [search, fWorkshop, fStatus]);

  const ActionBtn = ({ icon, title, color, onClick }) => (
    <button title={title} onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 7, border: '1px solid #E2E8F0',
      background: '#F8FAFC', color: color || '#475569',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 12 }} />
    </button>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Certificates</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>Generate, issue, and manage workshop completion certificates.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btnGhost}>
            <i className="ti ti-mail" style={{ fontSize: 13 }} /> Email All
          </button>
          <button style={S.btnPri}>
            <i className="ti ti-certificate" style={{ fontSize: 13 }} /> Generate All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard title="Certificates Issued" value={issued}     icon="certificate" accent="#10B981" sub="Eligible students" />
        <KPICard title="Pending"             value={pending}    icon="clock"       accent="#F59E0B" sub="Not yet eligible" />
        <KPICard title="Downloaded"          value={downloaded} icon="download"    accent="#3B82F6" sub="By participants" />
      </div>

      {/* Eligibility Info */}
      <div style={{ ...S.card, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 18, color: '#3B82F6', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#475569' }}>
          <strong>Certificate Eligibility:</strong> Attendance ≥ 60% AND Feedback submitted. Students who meet both criteria are automatically marked eligible.
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 14 }} />
          <input style={{ ...S.input, paddingLeft: 32 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, email or certificate ID…" />
        </div>
        <select style={S.input} value={fWorkshop} onChange={e => setFWorkshop(e.target.value)}>
          <option value="all">Workshop: All</option>
          {WORKSHOPS_MOCK.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select style={S.input} value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="all">Status: All</option>
          <option value="issued">Issued</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={S.panelHd}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Certificate Records</span>
          <span style={S.pill}>{filtered.length} records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>{['Student','Workshop','Certificate ID','Attendance','Status','Issued Date','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: 40, color: '#94A3B8' }}>No records found.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 ? '#FAFAFA' : '#fff' }}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.fullName}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.email}</div>
                  </td>
                  <td style={S.td}>{r.workshopName}</td>
                  <td style={S.td}>
                    {r.certId
                      ? <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, color: '#334155' }}>{r.certId}</span>
                      : <span style={{ color: '#94A3B8' }}>—</span>}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 50, height: 5, background: '#F1F5F9', borderRadius: 3 }}>
                        <div style={{ width: `${r.attendancePct}%`, height: '100%', background: r.attendancePct >= 60 ? '#10B981' : '#F59E0B', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{r.attendancePct}%</span>
                    </div>
                  </td>
                  <td style={S.td}>
                    {r.certificateEligible ? (
                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Issued</span>
                    ) : (
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Pending</span>
                    )}
                  </td>
                  <td style={S.td}>{r.issuedDate ? formatDateTime(r.issuedDate) : '—'}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <ActionBtn icon="download"  title="Download"       color="#3B82F6" onClick={() => {}} />
                      <ActionBtn icon="mail"       title="Email"          color="#10B981" onClick={() => {}} />
                      <ActionBtn icon="refresh"    title="Generate Again" color="#F59E0B" onClick={() => {}} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Showing {filtered.length} of {CERT_DATA.length} records</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...S.btnGhost, padding: '6px 12px', fontSize: 12 }}>‹ Prev</button>
            <button style={{ ...S.btnPri, padding: '6px 12px', fontSize: 12 }}>1</button>
            <button style={{ ...S.btnGhost, padding: '6px 12px', fontSize: 12 }}>Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
