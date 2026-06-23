import { useState } from 'react';
import { listReferrals, listCampaigns } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { controlClass, baseControl } from '../components/Field';
import { Icon } from '../components/Icon';
import { referralStatusVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { Referral, ReferralStatus } from '../types';

const STATUSES: ReferralStatus[] = ['pending', 'qualified', 'rewarded', 'reversed'];

/**
 * Referrals — who referred whom. A legible referrer → referee table (the brief
 * permits this over a force-graph) with a status filter + campaign filter.
 */
export function ReferralsScreen() {
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [status, setStatus] = useState<ReferralStatus | null>(null);

  const campaigns = useAsyncData(() => listCampaigns(), [], (d) => d.length === 0);
  const referrals = useAsyncData(
    () => listReferrals({ campaign_id: campaignId, status }),
    [campaignId, status],
    (d) => d.length === 0,
  );

  const columns: Column<Referral>[] = [
    {
      key: 'referrer',
      header: 'Referrer → Referee',
      cell: (r) => (
        <span className="flex items-center gap-2 font-mono text-xs">
          <span title="Referrer user id">#{r.referrer_id}</span>
          <Icon name="chevron" size={12} />
          <span title="Referee user id">#{r.referee_id}</span>
        </span>
      ),
    },
    {
      key: 'code_id',
      header: 'Code',
      cell: (r) => (
        <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {r.code_id != null ? `#${r.code_id}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      cell: (r) => (
        <StatBadge variant={referralStatusVariant[r.status]} testId={`referral-row-${r.id}-status`}>
          {r.status}
        </StatBadge>
      ),
    },
    {
      key: 'attributed_at',
      header: 'Attributed',
      sortValue: (r) => r.attributed_at ?? '',
      cell: (r) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(r.attributed_at)}
        </span>
      ),
    },
    {
      key: 'qualified_at',
      header: 'Qualified',
      sortValue: (r) => r.qualified_at ?? '',
      cell: (r) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(r.qualified_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="referrals-screen">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        Referrals
      </h1>

      <FilterBar
        testId="referrals-filter-bar"
        campaigns={campaigns.data ?? []}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="referrals-filter-status" className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Status
          </label>
          <select
            id="referrals-filter-status"
            data-testid="referrals-filter-status"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={status ?? ''}
            onChange={(e) => setStatus((e.target.value || null) as ReferralStatus | null)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <DataState
        state={referrals.state}
        testId="referrals-table"
        error={referrals.error}
        onRetry={referrals.reload}
        loading={<TableSkeleton columns={5} />}
        empty={
          <>
            <p className="text-base font-medium">No referrals match these filters</p>
            <p className="text-sm">Referrals appear here once invitees redeem a referral code.</p>
          </>
        }
      >
        {referrals.data && (
          <DataTable
            testId="referrals-datatable"
            columns={columns}
            rows={referrals.data}
            rowKey={(r) => r.id}
            caption="Referrals"
          />
        )}
      </DataState>
    </div>
  );
}
