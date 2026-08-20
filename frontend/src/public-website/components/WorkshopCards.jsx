import React, { useRef, useState, useEffect } from 'react';

const fmt = (d) => {
  try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }); }
  catch { return d; }
};

// Normalize both API shape and legacy mock shape
const normalize = (w) => {
  const status = w.status || (w.published ? 'Published' : 'Draft');
  const isCompleted = status === 'Completed' || status === 'completed' || status === 'COMPLETED';
  const isUpcoming = status === 'Published' || status === 'upcoming' || status === 'UPCOMING';

  return {
    id:          w._id || w.id,
    title:       w.title || w.name || 'Workshop',
    subtitle:    w.subtitle || '',
    description: w.description || '',
    trainer:     w.trainerName || w.trainer || w.trainerId?.name || '',
    date:        w.date || w.startDate,
    duration:    w.duration ? `${w.duration} min` : '90 min',
    seats:       w.availableSeats ?? w.seats ?? w.maxSeats ?? 0,
    maxSeats:    w.maxSeats ?? w.capacity ?? 0,
    registrationOpen: w.registrationOpen === true,
    published:   w.published === true || status === 'Published',
    isPaid:      w.isPaid ?? (w.feeType === 'Paid') ?? false,
    hasCert:     w.certificateEnabled ?? w.certificate ?? false,
    isUpcoming,
    isCompleted,
    mode:        w.mode || 'Online',
    status,
  };
};

function WorkshopCard({ w: raw, onDetails, onRegister, compact = false }) {
  const w = normalize(raw);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      style={{
        borderRadius: 20,
        background: hovered ? '#F0F6FF' : '#FFFFFF',
        border: `1px solid ${hovered ? 'rgba(37,99,235,0.35)' : '#E2E8F0'}`,
        boxShadow: hovered
          ? '0 12px 40px rgba(37,99,235,0.12), 0 2px 8px rgba(15,23,42,0.08)'
          : '0 2px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
        padding: compact ? 16 : 20,
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px) scale(1.02)`
          : 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)',
        transition: 'all 0.3s ease',
        backdropFilter: 'none',
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.04), transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: w.isUpcoming ? '#DCFCE7' : '#F1F5F9',
              border: `1px solid ${w.isUpcoming ? '#86EFAC' : '#CBD5E1'}`,
              color: w.isUpcoming ? '#16A34A' : '#64748B',
            }}>
              {w.isUpcoming ? '● Upcoming' : '✓ Completed'}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: w.isPaid ? '#EDE9FE' : '#CFFAFE',
              border: `1px solid ${w.isPaid ? '#C4B5FD' : '#A5F3FC'}`,
              color: w.isPaid ? '#7C3AED' : '#0891B2',
            }}>
              {w.isPaid ? 'Paid' : 'Free'}
            </span>
          </div>
          <h3 style={{ fontSize: compact ? 15 : 17, fontWeight: 700, color: '#0F172A', lineHeight: 1.3, margin: 0 }}>
            {w.title}
          </h3>
        </div>
        {w.hasCert && (
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🏅</div>
        )}
      </div>

      {!compact && w.description && (
        <p style={{ marginTop: 10, color: '#475569', fontSize: 13, lineHeight: 1.7, fontWeight: 500 }}>
          {w.description}
        </p>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { icon: '👤', val: w.trainer },
          { icon: '📅', val: fmt(w.date) },
          { icon: '⏱', val: w.duration },
          { icon: '💺', val: `${w.seats} seats` },
        ].filter(x => x.val).map(({ icon, val }) => (
          <span key={`${icon}-${val}`} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 8,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            fontSize: 12, color: '#475569', fontWeight: 600,
          }}>
            {icon} {val}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={onDetails} style={{
          flex: 1, padding: '10px 14px', borderRadius: 10,
          border: '1px solid #CBD5E1',
          background: '#F8FAFC',
          color: '#1E3A8A', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#1E3A8A'; e.currentTarget.style.borderColor = '#93C5FD'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1E3A8A'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
        >
          Details
        </button>
        {(() => {
          const canRegister = w.published && w.registrationOpen && w.isUpcoming && w.seats > 0 && !w.isCompleted;
          return (
            <button
              onClick={canRegister ? onRegister : undefined}
              disabled={!canRegister}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: canRegister
                  ? 'linear-gradient(135deg, #1E3A8A, #2563EB)'
                  : 'rgba(148,163,184,0.35)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                cursor: canRegister ? 'pointer' : 'not-allowed',
                boxShadow: canRegister ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!canRegister) return;
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.55)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                if (!canRegister) return;
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {w.isCompleted
                ? 'Completed'
                : !w.published || w.registrationOpen === false
                  ? 'Registration Closed'
                  : w.seats <= 0
                    ? 'Workshop Full'
                    : 'Register →'}
            </button>
          );
        })()}
      </div>
    </div>
  );
}

export function WorkshopCarousel({ workshops, onDetails, onRegister }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const doubled = [...workshops, ...workshops];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const speed = 0.4;
    let raf;
    const animate = () => {
      if (!paused) {
        pos += speed;
        const half = track.scrollWidth / 2;
        if (pos >= half) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={trackRef} style={{ display: 'flex', gap: 16, width: 'max-content' }}>
        {doubled.map((w, i) => (
          <div key={`${w._id || w.id}-${i}`} style={{ width: 340, flexShrink: 0 }}>
            <WorkshopCard w={w} onDetails={() => onDetails?.(w)} onRegister={() => onRegister?.(w)} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export { WorkshopCard };

export default function WorkshopCards({ workshops, onDetails, onRegister }) {
  if (!workshops || workshops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 14 }}>
        No workshops available at the moment. Check back soon!
      </div>
    );
  }
  return (
    <>
      <style>{`@media(max-width:640px){.ws-cards-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="ws-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
        {workshops.map((w) => (
          <WorkshopCard key={w._id || w.id} w={w} onDetails={() => onDetails?.(w)} onRegister={() => onRegister?.(w)} />
        ))}
      </div>
    </>
  );
}
