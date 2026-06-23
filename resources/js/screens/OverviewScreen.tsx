import { useMemo } from 'react';
import { getMetrics, listCampaigns } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState } from '../components/DataState';
import { KpiCard } from '../components/KpiCard';
import { FunnelChart } from '../components/charts';
import { FilterBar } from '../components/FilterBar';
import { compactNumber, formatPercent, formatDuration } from '../lib/format';
import type { InviteMetrics } from '../types';

export function OverviewScreen({
  sinceDays,
  campaignId,
  onCampaignChange,
}: {
  sinceDays: number;
  campaignId: number | null;
  onCampaignChange: (id: number | null) => void;
}) {
  // Campaign options for the filter derive from the real list (R18).
  const campaignsQuery = useAsyncData(() => listCampaigns(), [], (d) => d.length === 0);

  const metricsQuery = useAsyncData<InviteMetrics>(
    () => getMetrics({ campaign_id: campaignId, since_days: sinceDays }),
    [campaignId, sinceDays],
    // A zero-everything metrics object is still "ready" data, not empty — the
    // KPI grid renders zeros meaningfully. Treat it as empty only when the
    // funnel has literally never seen an invite or a code.
    (m) => m.codes_issued === 0 && m.invites_sent === 0 && m.redemptions === 0,
  );

  const funnelStages = useMemo(() => {
    const m = metricsQuery.data;
    if (!m) return [];
    return [
      { label: 'Sent', value: m.invites_sent },
      { label: 'Accepted', value: m.invites_accepted },
      { label: 'Redeemed', value: m.redemptions },
      { label: 'Rewarded', value: m.referrals_qualified },
    ];
  }, [metricsQuery.data]);

  return (
    <div className="flex flex-col gap-6" data-testid="overview-screen">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Overview
        </h1>
        <FilterBar
          testId="overview-filter-bar"
          campaigns={campaignsQuery.data ?? []}
          campaignId={campaignId}
          onCampaignChange={onCampaignChange}
        />
      </div>

      <DataState
        state={metricsQuery.state}
        testId="overview-metrics"
        error={metricsQuery.error}
        onRetry={metricsQuery.reload}
        loading={
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="ia-skeleton h-24 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-2)' }}
              />
            ))}
          </div>
        }
        empty={
          <>
            <p className="text-base font-medium">No activity yet</p>
            <p className="text-sm">
              Once codes are issued and invites are sent, your virality metrics appear here.
            </p>
          </>
        }
      >
        {metricsQuery.data && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard testId="overview-kpi-kfactor" label="K-factor" value={metricsQuery.data.k_factor.toFixed(2)} />
              <KpiCard
                testId="overview-kpi-acceptance"
                label="Acceptance rate"
                value={formatPercent(metricsQuery.data.acceptance_rate)}
              />
              <KpiCard
                testId="overview-kpi-conversion"
                label="Conversion rate"
                value={formatPercent(metricsQuery.data.conversion_rate)}
              />
              <KpiCard
                testId="overview-kpi-codes"
                label="Codes issued"
                value={compactNumber(metricsQuery.data.codes_issued)}
              />
              <KpiCard
                testId="overview-kpi-redemptions"
                label="Redemptions"
                value={compactNumber(metricsQuery.data.redemptions)}
              />
              <KpiCard
                testId="overview-kpi-referrers"
                label="Distinct referrers"
                value={compactNumber(metricsQuery.data.distinct_referrers)}
              />
              <KpiCard
                testId="overview-kpi-ttr-p50"
                label="Time-to-redeem p50"
                value={formatDuration(metricsQuery.data.ttr_p50_seconds)}
              />
              <KpiCard
                testId="overview-kpi-ttr-p90"
                label="Time-to-redeem p90"
                value={formatDuration(metricsQuery.data.ttr_p90_seconds)}
              />
            </div>

            <section
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Acquisition funnel
              </h2>
              <FunnelChart stages={funnelStages} testId="overview-funnel" />
            </section>
          </div>
        )}
      </DataState>
    </div>
  );
}
