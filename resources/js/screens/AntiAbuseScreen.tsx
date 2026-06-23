import { useState } from 'react';
import { listAbuseSignals } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { controlClass, baseControl } from '../components/Field';
import { abuseSeverityVariant, abuseActionVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { AbuseSignal, AbuseSeverity, AbuseAction } from '../types';

const SEVERITIES: AbuseSeverity[] = ['warn', 'block'];
const ACTIONS: AbuseAction[] = ['none', 'flag', 'throttle', 'block'];

/**
 * Anti-abuse signal feed. A calm security surface (brief §6.8) — danger color
 * is reserved for actual blocks. The subject value arrives already HMAC-hashed
 * from the core, so we render a truncated hash, never raw PII.
 */
export function AntiAbuseScreen() {
  const [severity, setSeverity] = useState<AbuseSeverity | null>(null);
  const [action, setAction] = useState<AbuseAction | null>(null);

  const signals = useAsyncData(
    () => listAbuseSignals({ severity, action }),
    [severity, action],
    (d) => d.length === 0,
  );

  function shortHash(value: string): string {
    return value.length > 16 ? `${value.slice(0, 12)}…` : value;
  }

  const columns: Column<AbuseSignal>[] = [
    {
      key: 'subject',
      header: 'Subject',
      cell: (s) => (
        <span className="flex flex-col">
          <span className="text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {s.subject_type}
          </span>
          <span className="font-mono text-xs" title={`hashed ${s.subject_type}`}>
            {shortHash(s.subject_value)}
          </span>
        </span>
      ),
    },
    {
      key: 'signal_type',
      header: 'Signal',
      sortValue: (s) => s.signal_type,
      cell: (s) => <span className="text-sm">{s.signal_type.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      sortValue: (s) => s.severity,
      cell: (s) => (
        <StatBadge variant={abuseSeverityVariant[s.severity]} testId={`abuse-row-${s.id}-severity`}>
          {s.severity}
        </StatBadge>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      sortValue: (s) => s.score,
      cell: (s) => <span className="font-mono text-sm">{s.score}</span>,
    },
    {
      key: 'action_taken',
      header: 'Action',
      sortValue: (s) => s.action_taken,
      cell: (s) => (
        <StatBadge variant={abuseActionVariant[s.action_taken]} testId={`abuse-row-${s.id}-action`}>
          {s.action_taken}
        </StatBadge>
      ),
    },
    {
      key: 'created_at',
      header: 'When',
      sortValue: (s) => s.created_at,
      cell: (s) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(s.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="abuse-screen">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        Anti-abuse
      </h1>

      <FilterBar testId="abuse-filter-bar">
        <div className="flex flex-col gap-1">
          <label htmlFor="abuse-filter-severity" className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Severity
          </label>
          <select
            id="abuse-filter-severity"
            data-testid="abuse-filter-severity"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={severity ?? ''}
            onChange={(e) => setSeverity((e.target.value || null) as AbuseSeverity | null)}
          >
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="abuse-filter-action" className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Action
          </label>
          <select
            id="abuse-filter-action"
            data-testid="abuse-filter-action"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={action ?? ''}
            onChange={(e) => setAction((e.target.value || null) as AbuseAction | null)}
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <DataState
        state={signals.state}
        testId="abuse-table"
        error={signals.error}
        onRetry={signals.reload}
        loading={<TableSkeleton columns={6} />}
        empty={
          <>
            <p className="text-base font-medium">No signals match these filters</p>
            <p className="text-sm">Anti-abuse signals appear here as the fraud detectors score activity.</p>
          </>
        }
      >
        {signals.data && (
          <DataTable
            testId="abuse-datatable"
            columns={columns}
            rows={signals.data}
            rowKey={(s) => s.id}
            caption="Anti-abuse signals"
          />
        )}
      </DataState>
    </div>
  );
}
