import { Icon, type IconName } from '../components/Icon';
import * as ds from '../components/ds';
import type { NavItem } from '../nav';

/**
 * Settings — a read-only view of the tenant's invite configuration (Padosoft DC
 * §6.9). Values are platform-managed; v1 shows them as labeled cards rather than
 * editable toggles (no fake controls). The `item` prop is accepted so the router
 * can render this for the Settings nav entry; the content is fixed config.
 */
interface SettingRow {
  k: string;
  v: string;
  d: string;
}
interface SettingGroup {
  title: string;
  icon: IconName;
  rows: SettingRow[];
}

const GROUPS: SettingGroup[] = [
  {
    title: 'Anti-abuse thresholds',
    icon: 'shield',
    rows: [
      { k: 'Flag score', v: '0.50', d: 'Above this, the subject is flagged for review.' },
      { k: 'Throttle score', v: '0.70', d: 'Above this, redemption rate is throttled.' },
      { k: 'Block score', v: '0.90', d: 'Above this, the subject is blocked outright.' },
    ],
  },
  {
    title: 'Velocity windows',
    icon: 'activity',
    rows: [
      { k: 'Per minute', v: '10 / min', d: 'Max redemptions per subject per minute.' },
      { k: 'Per hour', v: '100 / hr', d: 'Max redemptions per subject per hour.' },
    ],
  },
  {
    title: 'Privacy & retention',
    icon: 'user',
    rows: [{ k: 'PII retention', v: '90 days', d: 'Masked recipient data is purged after this window.' }],
  },
  {
    title: 'Defaults',
    icon: 'ticket',
    rows: [
      { k: 'Default code length', v: '12 chars', d: 'Used when a campaign does not override it.' },
      { k: 'Invitation TTL', v: '14 days', d: 'Time before an unaccepted invitation expires.' },
    ],
  },
];

export function PlaceholderScreen({ item }: { item: NavItem }) {
  return (
    <div className="flex flex-col gap-4" data-testid={`${item.id}-screen`}>
      <div>
        <h1 style={ds.h1}>Settings</h1>
        <p style={ds.subtitle}>
          Configuration for this tenant. Read-only in v1 — values are managed by the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} style={ds.card} data-testid={`settings-group-${g.icon}`}>
            <div
              className="flex items-center gap-2.5 px-4 py-4"
              style={{ borderBottom: '1px solid var(--line-faint)' }}
            >
              <span style={{ ...ds.iconChip, width: 28, height: 28, borderRadius: 8 }}>
                <Icon name={g.icon} size={16} />
              </span>
              <h2 style={{ ...ds.h2, fontSize: 14 }}>{g.title}</h2>
            </div>
            {g.rows.map((row) => (
              <div
                key={row.k}
                className="flex items-start justify-between gap-4 px-4 py-3"
                style={{ borderTop: '1px solid var(--line-faint)' }}
              >
                <div className="min-w-0">
                  <div style={{ fontSize: 13, color: 'var(--text-hi)', fontWeight: 500 }}>{row.k}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-low)', marginTop: 2 }}>{row.d}</div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--accent-ink)',
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    background: 'var(--cyan-a08)',
                    border: '1px solid var(--cyan-a14)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
