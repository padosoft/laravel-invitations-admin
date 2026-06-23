import type { InviteCampaign } from '../types';
import { controlClass, baseControl } from './Field';

/**
 * Reusable filter bar. Campaign options are derived from the real campaigns
 * list (R18 — never a literal subset). Each control is individually optional so
 * a screen renders only the filters it needs.
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
      className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {campaigns && onCampaignChange && (
        <div className="flex flex-col gap-1">
          <label htmlFor={`${testId}-campaign`} className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Campaign
          </label>
          <select
            id={`${testId}-campaign`}
            data-testid={`${testId}-campaign`}
            className={controlClass('min-w-[12rem]')}
            style={baseControl}
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
        </div>
      )}
      {children}
    </div>
  );
}
