import React, { useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorkshopById,
  selectCurrentWorkshop,
  selectCurrentStatus,
} from '../../features/workshops/workshopSlice';

const fmt = (d) => {
  try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }); }
  catch { return d || '—'; }
};

const InfoPill = ({ label, value }) => (
  <div style={{ padding: '10px 12px', borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', minWidth: 170 }}>
    <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 950, color: '#0F172A' }}>{value}</div>
  </div>
);

export default function WorkshopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const workshop = useSelector(selectCurrentWorkshop);
  const status = useSelector(selectCurrentStatus);

  useEffect(() => {
    if (id) dispatch(fetchWorkshopById(id));
  }, [id, dispatch]);

  const workshopId = id;

  const isLoading = status === 'loading';
  const isFailed = status === 'failed';
  const isSucceeded = status === 'succeeded';
  const isEmpty = !workshop && (isSucceeded || isFailed);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#0F172A' }}>
        Loading workshop...
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ color: '#0F172A', fontWeight: 950, fontSize: 22 }}>Workshop not found</div>
        <div style={{ marginTop: 8, color: '#475569', fontWeight: 700 }}>
          We couldn’t load details for this workshop.
        </div>
        <button
          onClick={() => navigate('/workshops')}
          style={{
            marginTop: 18,
            background: 'none',
            border: 'none',
            color: '#2563EB',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          Back to Workshops
        </button>
      </div>
    );
  }

  // Never return a blank page
  if (!workshop) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ color: '#0F172A', fontWeight: 950, fontSize: 22 }}>No workshop found</div>
        <button
          onClick={() => navigate('/workshops')}
          style={{
            marginTop: 18,
            background: 'none',
            border: 'none',
            color: '#2563EB',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          Back to Workshops
        </button>
      </div>
    );
  }

  const isPaid = workshop.isPaid ?? (workshop.feeType === 'Paid') ?? false;
  const trainerName = workshop.trainerName || workshop.trainerId?.name || '—';

  // Status normalization
  const workshopStatus = workshop.status || (workshop.published ? 'Published' : 'Draft');
  const isCompleted = workshopStatus === 'Completed' || workshopStatus === 'completed' || workshopStatus === 'COMPLETED';
  const isUpcoming = workshopStatus === 'Published' || workshopStatus === 'upcoming' || workshopStatus === 'UPCOMING';

  const registrationOpen = workshop.registrationOpen === true;
  const availableSeats = Number(workshop.availableSeats ?? workshop.seats ?? workshop.maxSeats ?? 0);
  const isPublished = workshop.published === true || workshopStatus === 'Published';

  const canRegister = isPublished && registrationOpen && isUpcoming && availableSeats > 0 && !isCompleted;

  const registerLabel = !isPublished
    ? 'Registration Closed'
    : !registrationOpen
      ? 'Registration Closed'
      : isCompleted
        ? 'Completed'
        : availableSeats <= 0
          ? 'Workshop Full'
          : 'Register for Workshop';

  const showRegisterButton = canRegister;
  const shouldHideRegisterForCompleted = isCompleted;

  const certificateEnabled = workshop.certificateEnabled ?? workshop.certificate ?? false;

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return d || '—';
    }
  };

  const duration = workshop.duration
    ? `${workshop.duration} min`
    : workshop.totalDuration
      ? `${workshop.totalDuration} min`
      : workshop.expectedDuration
        ? `${workshop.expectedDuration} min`
        : '—';

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Workshop Details
            </div>
            <h1 style={{ marginTop: 10, fontSize: 40, fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              {workshop.title}
            </h1>
            {workshop.subtitle && (
              <p style={{ marginTop: 8, color: '#475569', fontWeight: 700, fontSize: 16 }}>{workshop.subtitle}</p>
            )}
            <p style={{ marginTop: 12, color: '#475569', lineHeight: 1.8, fontWeight: 700 }}>
              {workshop.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
              <InfoPill label="Category" value={workshop.category || '—'} />
              <InfoPill label="Trainer" value={trainerName} />
              <InfoPill label="Mode" value={workshop.mode || '—'} />

              <InfoPill
                label="Start Date"
                value={fmtDate(workshop.startDate || workshop.date || workshop.start || workshop.startsOn)}
              />
              <InfoPill
                label="End Date"
                value={fmtDate(workshop.endDate || workshop.end || workshop.endsOn)}
              />

              <InfoPill label="Duration" value={duration} />

              <InfoPill label="Capacity" value={`${workshop.maxSeats ?? workshop.capacity ?? 0}`} />
              <InfoPill label="Available Seats" value={`${availableSeats}`} />

              <InfoPill
                label="Workshop Status"
                value={isCompleted ? 'Completed' : (workshopStatus || '—')}
              />
              <InfoPill label="Pricing" value={isPaid ? 'Paid' : 'Free'} />
              <InfoPill
                label="Certificate"
                value={certificateEnabled ? 'Available' : 'Not Available'}
              />
            </div>

            {workshop.learningOutcomes && (
              <div style={{ marginTop: 22, borderRadius: 18, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>Learning Outcomes</div>
                <p style={{ marginTop: 10, color: '#475569', fontWeight: 700, lineHeight: 1.8 }}>{workshop.learningOutcomes}</p>
              </div>
            )}

            {workshop.prerequisites && (
              <div style={{ marginTop: 14, borderRadius: 18, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>Prerequisites</div>
                <p style={{ marginTop: 10, color: '#475569', fontWeight: 700, lineHeight: 1.8 }}>{workshop.prerequisites}</p>
              </div>
            )}
          </div>

          <div>
            <div style={{ borderRadius: 18, background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 20px 70px rgba(0,0,0,0.4)', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Pricing</div>
                <div style={{
                  padding: '8px 12px', borderRadius: 999,
                  background: isPaid ? 'rgba(124,58,237,0.12)' : 'rgba(6,182,212,0.12)',
                  border: `1px solid ${isPaid ? 'rgba(124,58,237,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  color: isPaid ? '#A78BFA' : '#22D3EE', fontWeight: 900, fontSize: 12,
                }}>
                  {isPaid ? 'Paid' : 'Free'} Workshop
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 14, fontWeight: 900, color: '#0F172A' }}>
                {workshop.certificateEnabled ? 'Certificate Included' : 'No Certificate'}
              </div>

              <div style={{ marginTop: 12, color: '#475569', fontWeight: 700, lineHeight: 1.7, fontSize: 13 }}>
                Seats are limited. Register now to reserve your place.
              </div>

              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                {/* Register visibility + availability handling */}
                {!shouldHideRegisterForCompleted && (
                  <>
                    {!canRegister ? (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1.5px solid #E2E8F0',
                          background: 'rgba(148,163,184,0.10)',
                          color: '#0F172A',
                          fontWeight: 950,
                          textAlign: 'center',
                        }}
                      >
                        {workshop.registrationOpen === false ? 'Registration Closed' : availableSeats <= 0 ? 'Workshop Full' : 'Registration Closed'}
                      </div>
                    ) : null}

                    {showRegisterButton && (
                      <button
                        disabled={!canRegister}
                        onClick={() => navigate(`/workshop/register?workshopId=${workshop._id}`)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: 'none',
                          background: canRegister
                            ? 'linear-gradient(135deg, #1E3A8A, #2563EB)'
                            : 'rgba(148,163,184,0.45)',
                          color: '#FFFFFF',
                          fontWeight: 950,
                          cursor: canRegister ? 'pointer' : 'not-allowed',
                          fontSize: 14,
                          boxShadow: canRegister ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                        }}
                      >
                        {registerLabel}
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => navigate('/workshops')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    background: 'transparent',
                    color: '#475569',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Back to Workshops
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
