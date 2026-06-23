import type { InviteCampaign } from '../types';
import { Icon } from './Icon';
import { fieldSel } from './ds';

/**
 * Reusable filter bar (Padosoft DC look). Campaign options are derived from the
 * real campaigns list (R18 — never a literal subset). Each control is
 * individually optional so a screen renders only the filters it needs.
 */
export function FilterBar({
  campaigns,
  campaignId,
  onCampaignChange,
  testId,
  children,
}: {
  campaigns?: InviteCampaign[];
  campaignId?: number | null;
  onCampaignChange?: (id: number | null) => void;
  testId: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        <Icon name="filter" size={14} /> Filters
      </span>
      {campaigns && onCampaignChange && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="vh">Filter by campaign</span>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              id={`${testId}-campaign`}
              data-testid={`${testId}-campaign`}
              style={{ ...fieldSel, width: 'auto', minWidth: 180, height: 34 }}
              value={campaignId ?? ''}
              onChange={(e) => onCampaignChange(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 9, pointerEvents: 'none', color: 'var(--text-low)' }}>
              <Icon name="chevDown" size={14} />
            </span>
          </span>
        </label>
      )}
      {children}
    </div>
  );
}
