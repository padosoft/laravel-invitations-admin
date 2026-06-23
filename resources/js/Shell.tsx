import type { ReactNode } from 'react';
import { NAV, type SectionId } from './nav';
import { Icon } from './components/Icon';
import { useTheme } from './lib/useTheme';
import { tenantLabel } from './api/client';
import logoOrb from './assets/logo-orb.png';

/**
 * Global shell (Padosoft dark-HUD): left ig-sidebar (funnel order + quota
 * widget) + top bar (breadcrumb, search, tenant indicator, date range, theme
 * toggle, help). The toast region is mounted by ToastProvider higher up.
 * Responsive: the nav collapses to an icon rail < 1280px (theme.css @media).
 */
const RANGES: { id: string; days: number; label: string }[] = [
  { id: '7d', days: 7, label: '7d' },
  { id: '30d', days: 30, label: '30d' },
  { id: '90d', days: 90, label: '90d' },
];

const iconBtn = {
  width: 34,
  height: 34,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--line-1)',
  background: 'var(--bg-raised)',
  color: 'var(--text-low)',
  cursor: 'pointer',
  transition: 'var(--t-color)',
} as const;

export function Shell({
  active,
  onNavigate,
  sinceDays,
  onSinceDaysChange,
  children,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  sinceDays: number;
  onSinceDaysChange: (days: number) => void;
  children: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const activeItem = NAV.find((n) => n.id === active);

  return (
    <div
      className="ig-root"
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: 'var(--bg-base)',
        color: 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
      }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside
        className="ig-sidebar"
        aria-label="Primary"
        data-testid="app-nav"
        style={{
          width: 248,
          flexShrink: 0,
          height: '100%',
          boxSizing: 'border-box',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--line-1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          position: 'relative',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px' }}>
          <img
            src={logoOrb}
            width={28}
            height={28}
            alt="Padosoft"
            style={{ filter: 'drop-shadow(0 0 8px rgba(123,200,90,0.35))' }}
          />
          <span
            className="ig-brandword"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--text-hi)' }}
          >
            pado<span style={{ color: 'var(--cyan-500)' }}>soft</span>
          </span>
        </div>

        <div
          className="ig-side-extra"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 10px',
            margin: '0 0 6px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--line-1)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--cyan-500)', boxShadow: '0 0 8px var(--cyan-500)', animation: 'pds-pulse 2.4s var(--ease-in-out) infinite' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-hi)', letterSpacing: '-0.01em' }}>
            Invitations &amp; Growth
          </span>
        </div>

        <div
          className="ig-side-extra"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', padding: '14px 10px 8px' }}
        >
          Funnel
        </div>

        <nav role="navigation" aria-label="Sections" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const on = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`app-nav-${item.id}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13.5,
                  width: '100%',
                  transition: 'all 140ms var(--ease-out)',
                  background: on ? 'var(--cyan-a08)' : 'transparent',
                  color: on ? 'var(--accent-ink)' : 'var(--text-low)',
                  boxShadow: on ? 'inset 0 0 0 1px var(--cyan-a24)' : 'none',
                  fontWeight: on ? 600 : 500,
                }}
              >
                <span style={{ display: 'inline-flex', width: 18, justifyContent: 'center' }}>
                  <Icon name={item.icon} size={17} />
                </span>
                <span className="ig-navlabel" style={{ flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {!item.implemented && (
                  <span className="ig-navlabel" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="ig-side-extra" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-raised)', border: '1px solid var(--line-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-low)' }}>
                Quota · invites
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-ink)' }}>68%</span>
            </div>
            <div style={{ height: 5, background: 'var(--bg-inset)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: 'var(--grad-signal)', boxShadow: '0 0 10px var(--cyan-500)' }} />
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mid)' }}>
              8.5k / 12.5k this period
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <header
          className="ig-topbar"
          style={{
            height: 60,
            flexShrink: 0,
            boxSizing: 'border-box',
            borderBottom: '1px solid var(--line-1)',
            background: 'var(--topbar-bg)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 22px',
            position: 'relative',
            zIndex: 20,
            gap: 16,
          }}
        >
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
              {activeItem?.crumb}
            </span>
            <span style={{ color: 'var(--text-faint)' }}>
              <Icon name="chevRight" size={14} />
            </span>
            <span
              data-testid="app-breadcrumb-active"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-hi)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
            >
              {activeItem?.title}
            </span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="ig-topbar-search"
              aria-hidden="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 34,
                padding: '0 12px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-low)',
                width: 190,
              }}
            >
              <Icon name="search" size={16} />
              <span style={{ fontSize: 13 }}>Search</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
                ⌘K
              </span>
            </div>

            <div
              data-testid="app-tenant-indicator"
              title="Active tenant — switching is the host app's job"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 34,
                padding: '0 10px 0 8px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--line-1)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--grad-agent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#fff' }}>
                {tenantLabel.charAt(0).toUpperCase()}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                  Tenant
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)', marginTop: 2 }}>{tenantLabel}</span>
              </span>
            </div>

            <div
              role="group"
              aria-label="Date range"
              style={{ display: 'flex', alignItems: 'center', height: 34, padding: 3, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', gap: 2 }}
            >
              <label htmlFor="app-date-range" className="vh">
                Date range
              </label>
              {RANGES.map((r) => {
                const on = sinceDays === r.days;
                return (
                  <button
                    key={r.id}
                    type="button"
                    data-testid={r.id === '30d' ? 'app-date-range' : `app-date-range-${r.id}`}
                    id={r.id === '30d' ? 'app-date-range' : undefined}
                    aria-pressed={on}
                    onClick={() => onSinceDaysChange(r.days)}
                    style={{
                      height: 28,
                      padding: '0 11px',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      background: on ? 'var(--bg-raised)' : 'transparent',
                      color: on ? 'var(--text-hi)' : 'var(--text-low)',
                      boxShadow: on ? 'inset 0 0 0 1px var(--line-2)' : 'none',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-testid="app-theme-toggle"
              onClick={toggle}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              title="Toggle theme"
              style={iconBtn}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <button type="button" aria-label="Notifications" title="Notifications" style={iconBtn}>
              <Icon name="bell" size={17} />
            </button>
            <button type="button" aria-label="Help" title="Help" style={iconBtn}>
              <Icon name="help" size={17} />
            </button>
            <div
              aria-hidden="true"
              style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--grad-agent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff', boxShadow: '0 0 0 1px var(--line-2)' }}
            >
              MR
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }} data-testid="app-main">
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--grid-line-bg)', backgroundSize: '34px 34px', opacity: 0.6, pointerEvents: 'none' }}
          />
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0 0 auto', height: 320, background: 'var(--grad-aurora)', opacity: 'var(--app-glow)', pointerEvents: 'none' }}
          />
          <div style={{ position: 'relative', padding: '24px 26px 64px', maxWidth: 1320, margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
