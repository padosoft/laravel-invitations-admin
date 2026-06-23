import type { CSSProperties } from 'react';

/*
 * Shared Padosoft-DS style objects + the badge tone map, ported verbatim from
 * the Claude Design DC's renderVals(). Components consume these so the HUD look
 * is identical across screens. Everything references var(--…) tokens — no hex.
 */

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'violet' | 'neutral';

const TONES: Record<Tone, { fg: string; bg: string; bd: string }> = {
  success: { fg: 'var(--success)', bg: 'rgba(47,245,168,0.13)', bd: 'rgba(47,245,168,0.30)' },
  warning: { fg: 'var(--warning)', bg: 'rgba(255,207,92,0.13)', bd: 'rgba(255,207,92,0.30)' },
  danger: { fg: 'var(--danger)', bg: 'rgba(255,92,122,0.13)', bd: 'rgba(255,92,122,0.32)' },
  info: { fg: 'var(--blue-400)', bg: 'rgba(46,155,255,0.13)', bd: 'rgba(46,155,255,0.30)' },
  cyan: { fg: 'var(--accent-ink)', bg: 'var(--cyan-a14)', bd: 'var(--cyan-a24)' },
  violet: { fg: 'var(--violet-400)', bg: 'rgba(123,108,255,0.15)', bd: 'rgba(123,108,255,0.32)' },
  neutral: { fg: 'var(--text-low)', bg: 'rgba(120,200,220,0.08)', bd: 'var(--line-2)' },
};

export function badgeStyle(tone: Tone): CSSProperties {
  const t = TONES[tone] ?? TONES.neutral;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 22,
    padding: '0 9px',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    fontSize: 10.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: t.fg,
    background: t.bg,
    border: '1px solid ' + t.bd,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  };
}

export const card: CSSProperties = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--line-1)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  overflow: 'hidden',
};

export const primaryBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 36,
  padding: '0 15px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--cyan-500)',
  color: 'var(--text-on-accent)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 600,
  boxShadow: 'var(--shadow-accent)',
  whiteSpace: 'nowrap',
};

export const ghostBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: 36,
  padding: '0 13px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--line-2)',
  cursor: 'pointer',
  background: 'var(--bg-raised)',
  color: 'var(--text-mid)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

export const dangerBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 36,
  padding: '0 15px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--danger)',
  cursor: 'pointer',
  background: 'var(--danger)',
  color: '#2a0810',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

export const iconBtnSm: CSSProperties = {
  width: 30,
  height: 30,
  display: 'inline-grid',
  placeItems: 'center',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line-1)',
  background: 'var(--bg-raised)',
  color: 'var(--text-low)',
  cursor: 'pointer',
  transition: 'var(--t-color)',
};

export const pagerBtn: CSSProperties = {
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line-2)',
  background: 'var(--bg-raised)',
  color: 'var(--text-mid)',
  cursor: 'pointer',
};

export const th: CSSProperties = {
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-low)',
  fontWeight: 600,
  padding: '11px 16px',
  whiteSpace: 'nowrap',
};

export const thSortBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'inherit',
  font: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  padding: 0,
};

export const td: CSSProperties = {
  padding: '12px 16px',
  borderTop: '1px solid var(--line-faint)',
  verticalAlign: 'middle',
};

export const input: CSSProperties = {
  width: '100%',
  height: 38,
  padding: '0 12px',
  background: 'var(--bg-inset)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-hi)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13.5,
  boxSizing: 'border-box',
};

export const area: CSSProperties = {
  ...input,
  height: 'auto',
  minHeight: 74,
  padding: '10px 12px',
  resize: 'vertical',
  lineHeight: 1.5,
};

export const fieldSel: CSSProperties = {
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  height: 38,
  padding: '0 30px 0 12px',
  background: 'var(--bg-inset)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-hi)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13.5,
  cursor: 'pointer',
  boxSizing: 'border-box',
};

export const selSm: CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  height: 30,
  padding: '0 26px 0 10px',
  background: 'var(--bg-raised)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-hi)',
  fontFamily: 'var(--font-sans)',
  fontSize: 12.5,
  cursor: 'pointer',
};

export const fLabel: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-low)',
  marginBottom: 7,
};

export const monoLabel: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-faint)',
};

export const h1: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 26,
  letterSpacing: '-0.02em',
  color: 'var(--text-hi)',
  margin: '0 0 4px',
};

export const h2: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 15,
  color: 'var(--text-hi)',
  margin: 0,
};

export const subtitle: CSSProperties = {
  margin: 0,
  fontSize: 13.5,
  color: 'var(--text-low)',
};

/** Cyan icon chip used in KPI cards / settings group headers. */
export const iconChip: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent-ink)',
  background: 'var(--cyan-a08)',
  border: '1px solid var(--cyan-a14)',
};
