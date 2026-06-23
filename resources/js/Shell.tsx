import { useState, type ReactNode } from 'react';
import { NAV, type SectionId } from './nav';
import { Icon } from './components/Icon';
import { useTheme } from './lib/useTheme';
import { tenantLabel } from './api/client';

/**
 * Global shell: collapsible left nav + top bar (breadcrumb, tenant indicator,
 * date-range, theme toggle, help) + the toast region is mounted by ToastProvider
 * higher up. Responsive: the nav collapses to an icon rail on narrow viewports.
 */
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
  const [collapsed, setCollapsed] = useState(false);
  const activeItem = NAV.find((n) => n.id === active);

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <nav
        aria-label="Primary"
        data-testid="app-nav"
        className="flex shrink-0 flex-col border-r transition-all"
        style={{
          width: collapsed ? 64 : 232,
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)' }}
            aria-hidden="true"
          >
            I
          </span>
          {!collapsed && (
            <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
              Invitations
              <br />& Growth
            </span>
          )}
        </div>

        <ul className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-testid={`app-nav-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  <Icon name={item.icon} size={18} />
                  {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {!collapsed && !item.implemented && (
                    <span className="text-[10px] uppercase opacity-60">soon</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          data-testid="app-nav-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
          className="m-2 flex items-center justify-center rounded-md py-2 hover:opacity-80"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span style={{ transform: collapsed ? 'none' : 'rotate(180deg)' }}>
            <Icon name="chevron" size={16} />
          </span>
        </button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between gap-4 border-b px-6 py-3"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <nav aria-label="Breadcrumb" className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>Invitations &amp; Growth</span>
            <span className="mx-1.5" aria-hidden="true">
              ▸
            </span>
            <span style={{ color: 'var(--color-text)' }} data-testid="app-breadcrumb-active">
              {activeItem?.label}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span
              data-testid="app-tenant-indicator"
              className="rounded-md border px-2.5 py-1 text-xs font-medium"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface-2)',
              }}
              title="Active tenant (read-only — switching is the host app's job)"
            >
              Tenant: {tenantLabel}
            </span>

            <div className="flex items-center gap-1.5">
              <label htmlFor="app-date-range" className="vh">
                Date range
              </label>
              <select
                id="app-date-range"
                data-testid="app-date-range"
                value={sinceDays}
                onChange={(e) => onSinceDaysChange(Number(e.target.value))}
                className="rounded-md border px-2 py-1 text-xs"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            <button
              type="button"
              data-testid="app-theme-toggle"
              onClick={toggle}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              className="rounded-md border p-1.5 hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" data-testid="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
