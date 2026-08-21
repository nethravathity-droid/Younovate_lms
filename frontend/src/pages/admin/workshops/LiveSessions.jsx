import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorkshopSessions,
  fetchWorkshopBatchesForSchedule,
  createWorkshopSession,
  fetchSessionParticipants,
  fetchSessionAttendanceWS,
  selectWorkshopSessions,
  selectWSSessionStatus,
  selectWSSessionError,
  selectWSBatches,
  selectWSBatchStatus,
  selectWSSaveStatus,
  selectWSSaveError,
  selectWSParticipants,
  selectWSAttendance,
  clearWSSessionErrors,
} from '../../../features/workshops/workshopSessionsSlice';
import { minDateTime } from '../../../utils/dateTime';

const S = {
  page:    { padding: '20px 28px', fontFamily: 'Public Sans, system-ui, sans-serif', background: '#F1F5F9', minHeight: '100vh' },
  card:    { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 3px rgba(15,23,42,.05),0 4px 16px rgba(30,58,95,.06)' },
  panelHd: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' },
  btnPri:  { background: '#1E3A5F', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  btnGhost:{ background: '#fff', color: '#475569', border: '1px solid #E2E8F0', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  btnGreen:{ background: '#10B981', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  btnRed:  { background: '#EF4444', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  th:      { padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: '#94A3B8', background: '#F8FAFC', textAlign: 'left' },
  td:      { padding: '11px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' },
  pill:    { fontSize: 11, color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '3px 10px', fontWeight: 600 },
  input:   { width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', color: '#0F172A', background: '#fff' },
};

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const fmtShort = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const statusColor = (s) => {
  if (s === 'live')      return { bg: '#FEF2F2', color: '#DC2626' };
  if (s === 'completed') return { bg: '#F0FDF4', color: '#16A34A' };
  if (s === 'cancelled') return { bg: '#FEF3C7', color: '#D97706' };
  return { bg: '#EFF6FF', color: '#2563EB' };
};

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

function SessionCard({ session, onSelect, isActive }) {
  const sc = statusColor(session.status);
  return (
    <div
      onClick={() => onSelect(session)}
      style={{ ...S.card, padding: 16, cursor: 'pointer', border: isActive ? '2px solid #1E3A5F' : '1px solid #E2E8F0', transition: 'all 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{session.title}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>{session.trainerId?.name || '—'} · {session.workshopBatchId?.batchName || session.batchName || '—'}</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{fmtShort(session.scheduledAt)} · {session.durationMinutes} min</div>
        </div>
        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          {session.status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />}
          {session.status}
        </span>
      </div>
    </div>
  );
}

// Schedule Session modal
function ScheduleModal({ batches, batchStatus, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState({ workshopBatchId: '', title: '', scheduledAt: '', durationMinutes: 60, description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.workshopBatchId || !form.title.trim() || !form.scheduledAt) return;

    const now = new Date();
    const local = new Date(form.scheduledAt);
    if (local < now) {
      alert('Session date/time cannot be in the past.');
      return;
    }

    onSave(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(15,23,42,.25)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Schedule Workshop Session</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 14 }}>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 5 }}>Workshop Batch *</span>
            <select style={S.input} value={form.workshopBatchId} onChange={e => set('workshopBatchId', e.target.value)} required>
              <option value="">{batchStatus === 'loading' ? 'Loading batches…' : 'Select batch…'}</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.batchName} — {b.workshopId?.title || ''}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 5 }}>Session Title *</span>
            <input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. AI Boot-Up — Session 1" required />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 5 }}>Date & Time *</span>
              <input type="datetime-local" style={S.input} value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} required min={minDateTime()} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 5 }}>Duration (min)</span>
              <input type="number" min={15} max={600} style={S.input} value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} />
            </label>
          </div>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 5 }}>Description (optional)</span>
            <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </label>
          {saveError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#B91C1C' }}>⚠️ {saveError}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={S.btnGhost}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...S.btnPri, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Scheduling…' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LiveSessions() {
  const dispatch = useDispatch();

  const sessions     = useSelector(selectWorkshopSessions);
  const status       = useSelector(selectWSSessionStatus);
  const error        = useSelector(selectWSSessionError);
  const batches      = useSelector(selectWSBatches);
  const batchStatus  = useSelector(selectWSBatchStatus);
  const saveStatus   = useSelector(selectWSSaveStatus);
  const saveError    = useSelector(selectWSSaveError);

  const [selectedSession, setSelectedSession] = useState(null);
  const [showSchedule, setShowSchedule]       = useState(false);
  const [announcement, setAnnouncement]       = useState('');
  const [announcements, setAnnouncements]     = useState([]);

  const sessionId    = selectedSession?._id;
  const participants = useSelector(selectWSParticipants(sessionId));
  const attendance   = useSelector(selectWSAttendance(sessionId));

  useEffect(() => {
    dispatch(fetchWorkshopSessions());
    dispatch(fetchWorkshopBatchesForSchedule());
  }, [dispatch]);

  // When a session is selected, load its participants and attendance
  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchSessionParticipants(sessionId));
    dispatch(fetchSessionAttendanceWS(sessionId));
  }, [sessionId, dispatch]);

  // Keep selectedSession in sync with updated sessions list
  useEffect(() => {
    if (!selectedSession) return;
    const updated = sessions.find(s => s._id === selectedSession._id);
    if (updated) setSelectedSession(updated);
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveSession = async (form) => {
    const result = await dispatch(createWorkshopSession({
      workshopBatchId: form.workshopBatchId,
      title:           form.title.trim(),
      scheduledAt:     new Date(form.scheduledAt).toISOString(),
      durationMinutes: Number(form.durationMinutes) || 60,
      description:     form.description || '',
    }));
    if (createWorkshopSession.fulfilled.match(result)) {
      setShowSchedule(false);
      dispatch(clearWSSessionErrors());
    }
  };

  const postAnnouncement = () => {
    if (!announcement.trim()) return;
    setAnnouncements(prev => [{ text: announcement.trim(), time: new Date() }, ...prev]);
    setAnnouncement('');
  };

  const today     = sessions.filter(s => new Date(s.scheduledAt).toDateString() === new Date().toDateString());
  const upcoming  = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) > new Date());
  const live      = sessions.filter(s => s.status === 'live');
  const completed = sessions.filter(s => s.status === 'completed');

  // Build attendance map for the selected session
  const attMap = {};
  attendance.forEach(a => { if (a.studentId) attMap[a.studentId.toString()] = a; });

  const joined    = participants.filter(p => {
    const key = (p.userId?._id || p.userId || p._id)?.toString();
    const att = p.attendance || attMap[key];
    return att?.attendanceStatus === 'Present' || att?.attendanceStatus === 'Partial';
  });
  const notJoined = participants.filter(p => {
    const key = (p.userId?._id || p.userId || p._id)?.toString();
    const att = p.attendance || attMap[key];
    return !att || att.attendanceStatus === 'Absent';
  });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Live Sessions</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>Manage and conduct live workshop sessions.</p>
        </div>
        <button style={S.btnPri} onClick={() => setShowSchedule(true)}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> Schedule Session
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KPICard title="Today's Sessions"  value={today.length}     icon="calendar-event" accent="#EF4444" sub="Happening today" />
        <KPICard title="Live Now"          value={live.length}      icon="broadcast"      accent="#DC2626" sub="Currently live" />
        <KPICard title="Upcoming"          value={upcoming.length}  icon="clock"          accent="#3B82F6" sub="Scheduled" />
        <KPICard title="Completed"         value={completed.length} icon="circle-check"   accent="#10B981" sub="All time" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 16 }}>

        {/* Session List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status === 'loading' && sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div style={{ ...S.card, padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              No sessions yet. Click "Schedule Session" to create one.
            </div>
          ) : (
            <>
              {live.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#DC2626', padding: '0 4px' }}>🔴 Live Now</div>
                  {live.map(s => <SessionCard key={s._id} session={s} onSelect={setSelectedSession} isActive={selectedSession?._id === s._id} />)}
                </>
              )}
              {today.filter(s => s.status !== 'live').length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', padding: '4px 4px 0' }}>Today</div>
                  {today.filter(s => s.status !== 'live').map(s => <SessionCard key={s._id} session={s} onSelect={setSelectedSession} isActive={selectedSession?._id === s._id} />)}
                </>
              )}
              {upcoming.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', padding: '4px 4px 0' }}>Upcoming</div>
                  {upcoming.map(s => <SessionCard key={s._id} session={s} onSelect={setSelectedSession} isActive={selectedSession?._id === s._id} />)}
                </>
              )}
              {completed.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', padding: '4px 4px 0' }}>Completed</div>
                  {completed.map(s => <SessionCard key={s._id} session={s} onSelect={setSelectedSession} isActive={selectedSession?._id === s._id} />)}
                </>
              )}
            </>
          )}
        </div>

        {/* Session Detail Panel */}
        {selectedSession ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Session Details */}
            <div style={S.card}>
              <div style={S.panelHd}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{selectedSession.title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                    {selectedSession.trainerId?.name || '—'} · {selectedSession.workshopBatchId?.batchName || selectedSession.batchName || '—'} · {fmtDate(selectedSession.scheduledAt)}
                  </div>
                </div>
              </div>

              {/* Session Status */}
              <div style={{ padding: '12px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Registered', value: participants.length,       color: '#3B82F6' },
                  { label: 'Joined',            value: joined.length,             color: '#10B981' },
                  { label: 'Not Joined',        value: notJoined.length,          color: '#F59E0B' },
                  { label: 'Duration',          value: `${selectedSession.durationMinutes} min`, color: '#8B5CF6' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

              {/* Participants */}
              <div style={S.card}>
                <div style={S.panelHd}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Participants</span>
                  <span style={S.pill}>{participants.length} total</span>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {participants.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No participants in this batch</div>
                  ) : participants.map(p => {
                    const att = attMap[p._id?.toString()];
                    const present = att?.attendanceStatus === 'Present' || att?.attendanceStatus === 'Partial';
                    return (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #F8FAFC' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{p.fullName}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.email}</div>
                        </div>
                        <span style={{ background: present ? '#D1FAE5' : '#FEF3C7', color: present ? '#065F46' : '#92400E', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {att?.attendanceStatus || 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Announcements */}
              <div style={S.card}>
                <div style={S.panelHd}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Announcements</span>
                </div>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={announcement}
                      onChange={e => setAnnouncement(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && postAnnouncement()}
                      placeholder="Type an announcement…"
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button style={{ ...S.btnPri, padding: '8px 12px' }} onClick={postAnnouncement}>
                      <i className="ti ti-send" style={{ fontSize: 13 }} />
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {announcements.map((a, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F8FAFC' }}>
                      <div style={{ fontSize: 13, color: '#334155' }}>{a.text}</div>
                       <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{a.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Attendance Table */}
            <div style={S.card}>
              <div style={S.panelHd}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Live Attendance</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Student', 'Email', 'Join Time', 'Status', 'Attendance %'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#94A3B8' }}>No participants yet</td></tr>
                    ) : participants.map(p => {
                      const att = attMap[p._id?.toString()];
                      const present = att?.attendanceStatus === 'Present' || att?.attendanceStatus === 'Partial';
                      return (
                        <tr key={p._id}>
                          <td style={S.td}><span style={{ fontWeight: 700 }}>{p.fullName}</span></td>
                          <td style={S.td}>{p.email}</td>
                          <td style={S.td}>{att?.joinTime ? new Date(att.joinTime).toLocaleTimeString() : '—'}</td>
                          <td style={S.td}>
                            <span style={{ background: present ? '#D1FAE5' : '#FEF3C7', color: present ? '#065F46' : '#92400E', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                              {att?.attendanceStatus || 'Pending'}
                            </span>
                          </td>
                          <td style={S.td}>{att?.attendancePct > 0 ? `${att.attendancePct}%` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div style={{ textAlign: 'center', color: '#94A3B8' }}>
              <i className="ti ti-video" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Select a session to manage</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Click any session from the list on the left</div>
            </div>
          </div>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          batches={batches}
          batchStatus={batchStatus}
          onClose={() => { setShowSchedule(false); dispatch(clearWSSessionErrors()); }}
          onSave={handleSaveSession}
          saving={saveStatus === 'loading'}
          saveError={saveError}
        />
      )}
    </div>
  );
}
