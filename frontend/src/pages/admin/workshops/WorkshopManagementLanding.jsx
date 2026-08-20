import React, { useMemo } from 'react';
import { WORKSHOPS_MOCK, normalizeWorkshopStatus } from './workshopMockData';
import WorkshopCardsRow from './_components/WorkshopCardsRow';

export default function WorkshopManagementLanding({ navigateTo }) {
  const stats = useMemo(() => {
    const draft = WORKSHOPS_MOCK.filter((w) => normalizeWorkshopStatus(w.status) === 'draft').length;
    const upcoming = WORKSHOPS_MOCK.filter((w) => normalizeWorkshopStatus(w.status) === 'upcoming').length;
    const completed = WORKSHOPS_MOCK.filter((w) => normalizeWorkshopStatus(w.status) === 'completed').length;
    const archived = WORKSHOPS_MOCK.filter((w) => normalizeWorkshopStatus(w.status) === 'archived').length;

    return {
      all: WORKSHOPS_MOCK.length,
      draft,
      upcoming,
      completed,
      archived,
    };
  }, []);

  const cards = [
    { key: 'all', label: 'All Workshops', value: stats.all, subtitle: 'Every workshop & event', accent: '#6366F1' },
    { key: 'drafts', label: 'Draft Workshops', value: stats.draft, subtitle: 'Not published yet', accent: '#F59E0B' },
    { key: 'upcoming', label: 'Upcoming Workshops', value: stats.upcoming, subtitle: 'Scheduled events', accent: '#0EA5E9' },
    { key: 'completed', label: 'Completed Workshops', value: stats.completed, subtitle: 'Attendance & feedback ready', accent: '#10B981' },
    { key: 'archived', label: 'Archived Workshops', value: stats.archived, subtitle: 'Hidden / archived', accent: '#657691' },
  ];

  return (
    <div style={page}>
      <div style={hero}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={kicker}>Workshop Management</div>
            <h1 style={title}>Admin control center for events & workshops</h1>
            <p style={sub}>Phase 2 • Mock data only • Draft → Publish → Attendance → Feedback → Certificates → Reports</p>
          </div>
        </div>

        <WorkshopCardsRow
          cards={cards}
          onCardClick={(key) => {
            if (navigateTo) navigateTo(key);
          }}
        />
      </div>
    </div>
  );
}

const page = { padding: '24px 24px 40px', fontFamily: 'Public Sans, system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh' };
const hero = {
  background: 'linear-gradient(135deg, #1E3A5F 0%, #1a2f52 55%, #231a4a 100%)',
  borderRadius: 18,
  padding: 22,
  border: '1px solid rgba(255,255,255,0.06)',
  marginBottom: 18,
  position: 'relative',
  overflow: 'hidden',
};
const kicker = { fontSize: 10, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' };
const title = { margin: '8px 0 0', fontSize: 22, fontWeight: 950, color: '#F8FAFC', lineHeight: 1.2 };
const sub = { marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, maxWidth: 680 };

