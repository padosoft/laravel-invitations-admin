import { useMemo, useState } from 'react';
import { listReferrals, listCampaigns } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState, EmptyState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { controlClass, baseControl } from '../components/Field';
import { Icon } from '../components/Icon';
import * as ds from '../components/ds';
import { referralStatusVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { Referral, ReferralStatus } from '../types';

const STATUS_COLOR: Record<ReferralStatus, string> = {
  pending: 'var(--warning)',
  qualified: 'var(--blue-400)',
  rewarded: 'var(--success)',
  reversed: 'var(--danger)',
};

/**
 * Hand-rolled inline-SVG attribution map: referrer nodes (left, cyan) →
 * referee nodes (right, colored by status) with bezier edges. Empty arrays are
 * guarded so we never feed Math.max([]) / NaN coordinates into the viewBox.
 */
function ReferralGraph({ rows }: { rows: Referral[] }) {
  const { referrers, edges, height } = useMemo(() => {
    const refIds = Array.from(new Set(rows.map((r) => r.referrer_id)));
    const h = Math.max(rows.length, refIds.length) * 40 + 30;
    const lerY = (id: number) => 30 + (refIds.indexOf(id) + 0.5) * ((h - 30) / Math.max(refIds.length, 1));
    const e = rows.map((r, i) => {
      const y1 = lerY(r.referrer_id);
      const y2 = 20 + (i + 0.5) * ((h - 20) / Math.max(rows.length, 1));
      return {
        id: r.id,
        d: `M162 ${y1.toFixed(1)} C 350 ${y1.toFixed(1)}, 360 ${y2.toFixed(1)}, 548 ${y2.toFixed(1)}`,
        y2,
        color: STATUS_COLOR[r.status],
        dash: r.status === 'pending' ? '4 4' : 'none',
        op: r.status === 'rewarded' ? 0.85 : 0.5,
        referee: r.referee_id,
      };
    });
    return {
      referrers: refIds.map((id) => ({ id, y: lerY(id), count: rows.filter((r) => r.referrer_id === id).length })),
      edges: e,
      height: h,
    };
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <svg viewBox={`0 0 720 ${height}`} width="100%" preserveAspectRatio="xMidYMin meet" style={{ overflow: 'visible', display: 'block' }} data-testid="referrals-graph">
      {edges.map((e) => (
        <path key={`e-${e.id}`} d={e.d} fill="none" stroke={e.color} strokeWidth={1.6} strokeDasharray={e.dash} opacity={e.op} />
      ))}
      {referrers.map((n) => (
        <g key={`l-${n.id}`}>
          <circle cx={150} cy={n.y} r={6} fill="var(--cyan-500)" style={{ filter: 'drop-shadow(0 0 5px var(--cyan-a40))' }} />
          <text x={138} y={n.y} textAnchor="end" dominantBaseline="middle" fontFamily="var(--font-sans)" fontSize={12.5} fontWeight={600} fill="var(--text-hi)">#{n.id}</text>
          <text x={162} y={n.y} dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--text-faint)">×{n.count}</text>
        </g>
      ))}
      {edges.map((e) => (
        <g key={`r-${e.id}`}>
          <circle cx={560} cy={e.y2} r={4.5} fill={e.color} />
          <text x={572} y={e.y2} dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize={11} fill="var(--text-mid)">#{e.referee}</text>
        </g>
      ))}
    </svg>
  );
}

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
          <span style={{ color: 'var(--text-faint)' }}>
            <Icon name="arrowRight" size={12} />
          </span>
          <span title="Referee user id">#{r.referee_id}</span>
        </span>
      ),
    },
    {
      key: 'code_id',
      header: 'Code',
      cell: (r) => (
        <span className="font-mono text-xs" style={{ color: 'var(--text-low)' }}>
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
        <span className="text-xs" style={{ color: 'var(--text-low)' }}>
          {formatDateTime(r.attributed_at)}
        </span>
      ),
    },
    {
      key: 'qualified_at',
      header: 'Qualified',
      sortValue: (r) => r.qualified_at ?? '',
      cell: (r) => (
        <span className="text-xs" style={{ color: 'var(--text-low)' }}>
          {formatDateTime(r.qualified_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="referrals-screen">
      <div>
        <h1 style={ds.h1}>Referral graph</h1>
        <p style={ds.subtitle}>Who referred whom — and how far each referral got down the funnel.</p>
      </div>

      <FilterBar
        testId="referrals-filter-bar"
        campaigns={campaigns.data ?? []}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="referrals-filter-status" className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>
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
          <EmptyState
            heading="No referrals match these filters"
            body="Referrals appear here once invitees redeem a referral code."
          />
        }
      >
        {referrals.data && (
          <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[1.25fr_1fr]">
            <section style={{ ...ds.card, padding: 18 }}>
              <div className="mb-2 flex items-center justify-between">
                <h2 style={ds.h2}>Attribution map</h2>
                <div className="flex gap-3.5">
                  {(['pending', 'qualified', 'rewarded'] as const).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-low)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: STATUS_COLOR[s] }} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between px-3 pt-1" style={ds.monoLabel}>
                <span>Referrers</span>
                <span>Referees</span>
              </div>
              <ReferralGraph rows={referrals.data} />
            </section>
            <DataTable
              testId="referrals-datatable"
              columns={columns}
              rows={referrals.data}
              rowKey={(r) => r.id}
              caption="Referrals"
            />
          </div>
        )}
      </DataState>
    </div>
  );
}
