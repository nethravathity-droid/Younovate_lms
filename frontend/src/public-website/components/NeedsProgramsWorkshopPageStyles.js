import { youvaTheme } from './youvaTokens';

export const pageCommonStyles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  hSectionEyebrow: {
    fontSize: 12,
    fontWeight: 1000,
    letterSpacing: '0.08em',
    color: youvaTheme.colors.accent,
    textTransform: 'uppercase',
  },
  h1: {
    marginTop: 8,
    fontSize: 40,
    fontWeight: 1000,
    color: youvaTheme.colors.text,
    lineHeight: 1.05,
  },
  pLead: {
    marginTop: 10,
    color: youvaTheme.colors.muted,
    fontWeight: 850,
    lineHeight: 1.8,
  },
};

