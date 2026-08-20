import React from 'react';
import { useNavigate } from 'react-router-dom';

const OPTIONS = [
  { icon: 'ti-writing', label: 'Join an AI Workshop', desc: 'Register for upcoming workshops', to: '/workshops', color: '#2563EB' },
  { icon: 'ti-book', label: 'Explore AI Programs', desc: 'YIEP & YBLP industry programs', to: '/programs', color: '#0F172A' },
  { icon: 'ti-school', label: 'Student Login', desc: 'Access your learning dashboard', to: '/login', color: '#16a05f' },
  { icon: 'ti-chalkboard', label: 'Trainer Login', desc: 'Manage sessions & batches', to: '/login', color: '#e67e22' },
  { icon: 'ti-users', label: 'HR Login', desc: 'Placement & pipeline management', to: '/login', color: '#8e44ad' },
  { icon: 'ti-layout-dashboard', label: 'Admin Login', desc: 'Full platform administration', to: '/login', color: '#e12e2a' },
];

export default function GetStartedModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const handleOption = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gs-overlay" onClick={onClose}>
        <div className="gs-modal" onClick={e => e.stopPropagation()}>
          <button className="gs-close" onClick={onClose}><i className="ti ti-x" /></button>
          <div className="gs-header">
            <h2>Get Started with YouVA OS</h2>
            <p>Choose how you'd like to begin your journey</p>
          </div>
          <div className="gs-grid">
            {OPTIONS.map(opt => (
              <button key={opt.label} className="gs-card" onClick={() => handleOption(opt.to)}>
                <div className="gs-icon" style={{ background: opt.color + '18', color: opt.color }}>
                  <i className={`ti ${opt.icon}`} />
                </div>
                <div>
                  <div className="gs-card-title">{opt.label}</div>
                  <div className="gs-card-desc">{opt.desc}</div>
                </div>
                <i className="ti ti-arrow-right gs-arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
  .gs-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(15,30,55,0.55);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: gs-fade-in 0.2s ease;
  }
  @keyframes gs-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .gs-modal {
    background: #fff; border-radius: 20px;
    padding: 36px 32px; max-width: 560px; width: 100%;
    box-shadow: 0 24px 64px rgba(15,30,55,0.22);
    position: relative;
    animation: gs-slide-up 0.25s ease;
  }
  @keyframes gs-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .gs-close {
    position: absolute; top: 16px; right: 16px;
    background: #f5f8fc; border: none; border-radius: 8px;
    width: 32px; height: 32px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: #475569;
    transition: background 0.2s;
  }
  .gs-close:hover { background: #dbe3ed; }
  .gs-header { margin-bottom: 24px; }
  .gs-header h2 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
  .gs-header p { font-size: 14px; color: #475569; }
  .gs-grid { display: flex; flex-direction: column; gap: 10px; }
  .gs-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 12px;
    border: 1.5px solid #f0f4f8; background: #fafcff;
    cursor: pointer; text-align: left;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  .gs-card:hover {
    border-color: #2563EB; box-shadow: 0 4px 16px rgba(37,99,235,0.08);
    transform: translateY(-1px);
  }
  .gs-icon {
    width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .gs-card-title { font-size: 14px; font-weight: 700; color: #172033; }
  .gs-card-desc { font-size: 12px; color: #475569; margin-top: 2px; }
  .gs-arrow { margin-left: auto; font-size: 16px; color: #a9bad0; flex-shrink: 0; }
  @media (max-width: 520px) {
    .gs-modal { padding: 28px 20px; }
  }
`;
