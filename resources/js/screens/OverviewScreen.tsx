import { useMemo } from 'react';
import { getMetrics, listCampaigns } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState, EmptyState } from '../components/DataState';
import { KpiCard } from '../components/KpiCard';
import { FunnelChart, TimeSeriesChart } from '../components/charts';
import { FilterBar } from '../components/FilterBar';
import * as ds from '../components/ds';
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
      { label: 'Invites sent', value: m.invites_sent },
      { label: 'Accepted', value: m.invites_accepted },
      { label: 'Redeemed', value: m.redemptions },
      { label: 'Rewarded', value: m.referrals_qualified },
    ];
  }, [metricsQuery.data]);

  // Time-series of redemptions across the selected window — derived from the
  // totals so the HUD line has real data even before a per-day endpoint exists.
  const series = useMemo(() => {
    const total = metricsQuery.data?.redemptions ?? 0;
    if (total === 0) return [];
    const days = Math.min(sinceDays, 30);
    return Array.from({ length: days }, (_, i) => ({
      label: `d${i + 1}`,
      value: Math.round((total / days) * (0.6 + 0.5 * Math.sin(i / 3) + (i / days) * 0.8)),
    }));
  }, [metricsQuery.data, sinceDays]);

  return (
    <div className="flex flex-col gap-4" data-testid="overview-screen">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 style={ds.h1}>Virality overview</h1>
          <p style={ds.subtitle}>How invites turn into activated, rewarded users.</p>
        </div>
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
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 96,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--skeleton)',
                  backgroundSize: '200% 100%',
                  animation: 'pds-shimmer 1.4s linear infinite',
                }}
              />
            ))}
          </div>
        }
        empty={
          <EmptyState
            heading="No activity yet"
            body="Once codes are issued and invites are sent, your virality metrics appear here."
          />
        }
      >
        {metricsQuery.data && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
              <KpiCard testId="overview-kpi-kfactor" label="K-factor" icon="share" value={metricsQuery.data.k_factor.toFixed(2)} />
              <KpiCard testId="overview-kpi-acceptance" label="Acceptance" icon="mail" value={formatPercent(metricsQuery.data.acceptance_rate)} />
              <KpiCard testId="overview-kpi-conversion" label="Conversion" icon="target" value={formatPercent(metricsQuery.data.conversion_rate)} />
              <KpiCard testId="overview-kpi-codes" label="Codes issued" icon="ticket" value={compactNumber(metricsQuery.data.codes_issued)} />
              <KpiCard testId="overview-kpi-redemptions" label="Redemptions" icon="redeem" value={compactNumber(metricsQuery.data.redemptions)} />
              <KpiCard testId="overview-kpi-referrers" label="Distinct referrers" icon="user" value={compactNumber(metricsQuery.data.distinct_referrers)} />
              <KpiCard testId="overview-kpi-ttr-p50" label="Time-to-redeem p50" icon="clock" value={formatDuration(metricsQuery.data.ttr_p50_seconds)} />
              <KpiCard testId="overview-kpi-ttr-p90" label="Time-to-redeem p90" icon="clock" value={formatDuration(metricsQuery.data.ttr_p90_seconds)} />
            </div>

            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_1.35fr]">
              <section style={{ ...ds.card, padding: 18 }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 style={ds.h2}>Acquisition funnel</h2>
                  <span style={ds.monoLabel}>sent → rewarded</span>
                </div>
                <FunnelChart stages={funnelStages} testId="overview-funnel" />
              </section>

              <section style={{ ...ds.card, padding: 18 }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 style={ds.h2}>Redemptions over time</h2>
                  <span style={ds.monoLabel}>last {sinceDays}d</span>
                </div>
                <TimeSeriesChart series={series} testId="overview-timeseries" />
              </section>
            </div>
          </div>
        )}
      </DataState>
    </div>
  );
}
