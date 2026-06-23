import { useMemo, useState } from 'react';
import { listWaitlist } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { MaskedEmail } from '../components/MaskedEmail';
import { controlClass, baseControl } from '../components/Field';
import { waitlistStatusVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { WaitlistEntry, WaitlistStatus } from '../types';

const STATUSES: WaitlistStatus[] = ['waiting', 'invited', 'converted', 'removed'];

/**
 * Waitlist — a read-only queue view. Rows are ordered priority desc, position
 * asc (refer-to-jump-the-queue virality); referral_count drives the priority.
 * Masked email keeps PII out of the rendered text (the core stores the real
 * address; we never auto-render it).
 */
export function WaitlistScreen() {
  const [status, setStatus] = useState<WaitlistStatus | null>(null);

  const waitlist = useAsyncData(
    () => listWaitlist({ status }),
    [status],
    (d) => d.length === 0,
  );

  // The core orders the result, but enforce the documented queue order client
  // side too so the read-only "queue" feel is stable regardless of payload order.
  const ordered = useMemo(() => {
    const rows = waitlist.data ?? [];
    return [...rows].sort((a, b) => b.priority - a.priority || a.position - b.position);
  }, [waitlist.data]);

  const columns: Column<WaitlistEntry>[] = [
    {
      key: 'position',
      header: '#',
      align: 'right',
      sortValue: (w) => w.position,
      cell: (w) => <span className="font-mono text-sm">{w.position}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (w) => <MaskedEmail email={w.email} testId={`waitlist-row-${w.id}-email`} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'right',
      sortValue: (w) => w.priority,
      cell: (w) => <span className="font-mono text-sm">{w.priority}</span>,
    },
    {
      key: 'referral_count',
      header: 'Referrals',
      align: 'right',
      sortValue: (w) => w.referral_count,
      cell: (w) => <span className="font-mono text-sm">{w.referral_count}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (w) => w.status,
      cell: (w) => (
        <StatBadge variant={waitlistStatusVariant[w.status]} testId={`waitlist-row-${w.id}-status`}>
          {w.status}
        </StatBadge>
      ),
    },
    {
      key: 'invited_at',
      header: 'Invited',
      sortValue: (w) => w.invited_at ?? '',
      cell: (w) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(w.invited_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="waitlist-screen">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        Waitlist
      </h1>

      <FilterBar testId="waitlist-filter-bar">
        <div className="flex flex-col gap-1">
          <label htmlFor="waitlist-filter-status" className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Status
          </label>
          <select
            id="waitlist-filter-status"
            data-testid="waitlist-filter-status"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={status ?? ''}
            onChange={(e) => setStatus((e.target.value || null) as WaitlistStatus | null)}
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
        state={waitlist.state}
        testId="waitlist-table"
        error={waitlist.error}
        onRetry={waitlist.reload}
        loading={<TableSkeleton columns={6} />}
        empty={
          <>
            <p className="text-base font-medium">The waitlist is empty</p>
            <p className="text-sm">Sign-ups appear here in queue order as they join.</p>
          </>
        }
      >
        {waitlist.data && (
          <DataTable
            testId="waitlist-datatable"
            columns={columns}
            rows={ordered}
            rowKey={(w) => w.id}
            caption="Waitlist queue"
          />
        )}
      </DataState>
    </div>
  );
}
