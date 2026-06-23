import { useState } from 'react';
import { listRewards } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState, EmptyState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { controlClass, baseControl } from '../components/Field';
import * as ds from '../components/ds';
import { rewardStateVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { Reward, RewardState, RewardParty } from '../types';

const STATES: RewardState[] = ['pending', 'granted', 'reversed', 'expired'];
const PARTIES: RewardParty[] = ['referrer', 'referee'];

/**
 * Rewards ledger — every reward row with its beneficiary, amount, trigger, and
 * state badge, filterable by state + party. Read-only here; manual confirm/
 * reverse mutations land when the core exposes those write endpoints.
 */
export function RewardsScreen() {
  const [state, setState] = useState<RewardState | null>(null);
  const [party, setParty] = useState<RewardParty | null>(null);

  const rewards = useAsyncData(
    () => listRewards({ state, party }),
    [state, party],
    (d) => d.length === 0,
  );

  function formatAmount(r: Reward): string {
    const amount = typeof r.amount === 'number' ? r.amount.toString() : r.amount;
    return r.unit ? `${amount} ${r.unit}` : amount;
  }

  const columns: Column<Reward>[] = [
    {
      key: 'beneficiary',
      header: 'Beneficiary',
      cell: (r) => (
        <span className="font-mono text-xs" title="Beneficiary user id">
          #{r.beneficiary_id}
        </span>
      ),
    },
    {
      key: 'party',
      header: 'Party',
      sortValue: (r) => r.party,
      cell: (r) => (
        <StatBadge variant={r.party === 'referrer' ? 'cyan' : 'violet'} testId={`reward-row-${r.id}-party`}>
          {r.party}
        </StatBadge>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => <span className="text-sm">{r.type}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (r) => <span className="font-mono text-sm">{formatAmount(r)}</span>,
    },
    {
      key: 'trigger',
      header: 'Trigger',
      cell: (r) => (
        <span className="text-xs" style={{ color: 'var(--text-low)' }}>
          {r.trigger ?? '—'}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'State',
      sortValue: (r) => r.state,
      cell: (r) => (
        <StatBadge variant={rewardStateVariant[r.state]} testId={`reward-row-${r.id}-state`}>
          {r.state}
        </StatBadge>
      ),
    },
    {
      key: 'granted_at',
      header: 'Granted',
      sortValue: (r) => r.granted_at ?? '',
      cell: (r) => (
        <span className="text-xs" style={{ color: 'var(--text-low)' }}>
          {formatDateTime(r.granted_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="rewards-screen">
      <div>
        <h1 style={ds.h1}>Reward ledger</h1>
        <p style={ds.subtitle}>Double-sided rewards moving through their lifecycle.</p>
      </div>

      <FilterBar testId="rewards-filter-bar">
        <div className="flex flex-col gap-1">
          <label htmlFor="rewards-filter-state" className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>
            State
          </label>
          <select
            id="rewards-filter-state"
            data-testid="rewards-filter-state"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={state ?? ''}
            onChange={(e) => setState((e.target.value || null) as RewardState | null)}
          >
            <option value="">All states</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="rewards-filter-party" className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>
            Party
          </label>
          <select
            id="rewards-filter-party"
            data-testid="rewards-filter-party"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={party ?? ''}
            onChange={(e) => setParty((e.target.value || null) as RewardParty | null)}
          >
            <option value="">All parties</option>
            {PARTIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <DataState
        state={rewards.state}
        testId="rewards-table"
        error={rewards.error}
        onRetry={rewards.reload}
        loading={<TableSkeleton columns={7} />}
        empty={
          <EmptyState
            heading="No rewards match these filters"
            body="Rewards accrue here as qualifying referrals are confirmed."
          />
        }
      >
        {rewards.data && (
          <DataTable
            testId="rewards-datatable"
            columns={columns}
            rows={rewards.data}
            rowKey={(r) => r.id}
            caption="Reward ledger"
          />
        )}
      </DataState>
    </div>
  );
}
