import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicWorkshops, selectPublicWorkshops, selectPublicStatus } from '../../features/workshops/workshopSlice';

import SectionShell from '../components/SectionShell';
import { youvaTheme } from '../components/youvaTokens';
import PageHeading from '../components/PageHeading';
import WorkshopCards from '../components/WorkshopCards';
import { pageCommonStyles } from '../components/NeedsProgramsWorkshopPageStyles';

export default function Workshops() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const allWorkshops = useSelector(selectPublicWorkshops);
  const status = useSelector(selectPublicStatus);

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchPublicWorkshops({ limit: 100 }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return allWorkshops.filter((w) => {
      const title = (w.title || w.name || '').toLowerCase();
      const trainer = (w.trainerName || w.trainer || '').toLowerCase();
      const category = (w.category || '').toLowerCase();
      const matchesQ = !qq || title.includes(qq) || trainer.includes(qq) || category.includes(qq);
      const isUpcoming = ['Published', 'upcoming'].includes(w.status) || !w.status;
      const isPaid = w.isPaid ?? (w.feeType === 'Paid') ?? false;
      const matchesFilter = (() => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return isUpcoming;
        if (filter === 'completed') return w.status === 'Completed';
        if (filter === 'free') return !isPaid && isUpcoming;
        if (filter === 'paid') return isPaid && isUpcoming;
        return true;
      })();
      return matchesQ && matchesFilter;
    });
  }, [allWorkshops, q, filter]);

  const onDetails = (w) => navigate(`/workshops/${w._id || w.id}`);
  const onRegister = (w) => navigate(`/workshop/register?workshopId=${w._id || w.id}`);

  return (
    <div style={{ background: youvaTheme.colors.bg, paddingBottom: 90 }}>
      <section style={{ paddingTop: 80 }}>
        <div style={pageCommonStyles.container}>
          <PageHeading
            eyebrow="AI WORKSHOPS"
            title="Live, practical sessions to power your next AI step"
            description="Join 90-minute workshops with instructor-led demos, practical exercises, and certificate options—then convert your learnings into program projects through YouVA OS."
          />
        </div>
      </section>

      <SectionShell paddingY={18} paddingBottom={20}>
        <div
          style={{
            borderRadius: 18,
            background: '#FFFFFF',
            border: `1px solid ${youvaTheme.colors.borderSoft}`,
            boxShadow: youvaTheme.shadow?.deep,
            padding: 18,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <label style={pageCommonStyles.hSectionEyebrow}>Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Workshop name, trainer, or category"
              style={{
                marginTop: 8,
                width: '100%',
                borderRadius: 12,
                border: `1.5px solid ${youvaTheme.colors.borderSoft}`,
                padding: '12px 14px',
                outline: 'none',
                background: '#fff',
                color: youvaTheme.colors.text,
                fontWeight: 750,
              }}
            />
          </div>

          <div style={{ flex: '0 0 220px' }}>
            <label style={pageCommonStyles.hSectionEyebrow}>Workshop Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                marginTop: 8,
                width: '100%',
                borderRadius: 12,
                border: `1.5px solid ${youvaTheme.colors.borderSoft}`,
                padding: '12px 14px',
                outline: 'none',
                background: '#fff',
                color: youvaTheme.colors.text,
                fontWeight: 850,
              }}
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </SectionShell>

      <div style={{ ...pageCommonStyles.container, marginTop: 18 }}>
        {status === 'loading' ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>Loading workshops...</div>
        ) : (
          <>
            <div style={{ fontWeight: 950, color: youvaTheme.colors.muted, marginBottom: 12 }}>
              Showing {filtered.length} workshop{filtered.length === 1 ? '' : 's'}
            </div>
            <WorkshopCards
              workshops={filtered}
              onDetails={onDetails}
              onRegister={onRegister}
            />
          </>
        )}
        <div style={{ marginTop: 16, color: youvaTheme.colors.muted, fontWeight: 800, lineHeight: 1.8 }}>
          Tip: Completed workshops help you revisit the core concepts—upcoming workshops let you register and reserve your seat.
        </div>
      </div>
    </div>
  );
}


