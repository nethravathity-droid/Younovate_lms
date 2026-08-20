export const youvaTheme = {
  colors: {
    backgroundPrimary: '#F8FAFC',
    backgroundSecondary: '#EEF4FF',
    cardBackground: '#FFFFFF',

    navbar: 'rgba(255,255,255,0.95)',
    primaryButton: '#1E3A8A',
    primaryHover: '#2563EB',

    accentBlue: '#3B82F6',
    accentCyan: '#0EA5E9',
    accentPurple: '#6366F1',

    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',

    textPrimary: '#0F172A',
    textSecondary: '#475569',

    borders: '#E2E8F0',

    // Aliases used by Home.jsx and other public pages
    bg: '#F8FAFC',
    text: '#0F172A',
    muted: '#475569',
    accent: '#1E3A8A',
    border: '#E2E8F0',
    borderSoft: '#E2E8F0',
  },

  radius: {
    xl: 22,
    lg: 18,
    md: 14,
    sm: 12,
    pill: 999,
  },

  shadow: {
    card: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(30,58,138,0.08)',
    cardHover: '0 4px 12px rgba(15,23,42,0.10), 0 16px 40px rgba(30,58,138,0.12)',
    deep: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(30,58,138,0.08)',
  },

  // Backwards-compatible aliases for existing components
  aliases: {
    bg: '#F8FAFC',
    bgLight: '#EEF4FF',
    panel: 'rgba(255,255,255,0.9)',
    panelLight: '#FFFFFF',
    panelSolid: '#FFFFFF',
    text: '#0F172A',
    textDark: '#0F172A',
    muted: '#475569',
    mutedDark: '#64748B',
    border: '#E2E8F0',
    borderLight: '#E2E8F0',

    brand1: '#1E3A8A',
    brand2: '#2563EB',

    accent: '#3B82F6',
    cyan: '#0EA5E9',
    accent2: '#10B981',

    footer: '#1E293B',

    glow: 'rgba(37,99,235,0.15)',
    glowPurple: 'rgba(99,102,241,0.15)',
    glowCyan: 'rgba(14,165,233,0.15)',
  },
};

export const youvaCTA = {
  primaryStyle: {
    padding: '13px 28px',
    borderRadius: 18,
    border: 'none',
    cursor: 'pointer',
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: 15,
    background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
    boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
    transition: '300ms ease',
  },
  secondaryStyle: {
    padding: '13px 28px',
    borderRadius: 18,
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    color: '#0F172A',
    fontWeight: 800,
    fontSize: 15,
    background: '#FFFFFF',
    transition: '300ms ease',
  },
};

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

