import React from 'react';
import { overlay, dialog, dialogHead, dialogFoot, bannerClose, btnGhost, btnPrimary } from './workshopDesignTokens';

export default function WorkshopModal({
  open,
  title,
  children,
  onClose,
  footer,
  maxWidth = 760,
}) {
  if (!open) return null;

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={() => onClose?.()}
    >
      <div
        style={{ ...dialog, maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={dialogHead}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#172033' }}>{title}</h3>
            <button type="button" style={bannerClose} onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}

        <div style={{ padding: 20 }}>{children}</div>

        {footer ? (
          <div style={dialogFoot}>{footer}</div>
        ) : (
          <div style={dialogFoot}>
            <button type="button" style={btnGhost} onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              style={btnPrimary}
              onClick={() => {
                // UI-only default
                onClose?.();
              }}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

