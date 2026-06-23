import { Sparkline } from './charts';

/**
 * KPI card: big value, label, optional delta vs. previous period, optional
 * sparkline. The delta arrow is paired with a sign text so it isn't color-only.
 */
export function KpiCard({
  label,
  value,
  delta,
  spark,
  testId,
}: {
  label: string;
  value: string;
  /** Fractional change vs. previous period, e.g. 0.12 = +12%. */
  delta?: number | null;
  spark?: number[];
  testId: string;
}) {
  const hasDelta = delta != null && Number.isFinite(delta);
  const positive = hasDelta && (delta as number) >= 0;
  const deltaColor = positive ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-2 rounded-xl border p-4"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold leading-none" style={{ color: 'var(--color-text)' }} data-testid={`${testId}-value`}>
          {value}
        </span>
        {spark && spark.length > 1 && <Sparkline points={spark} />}
      </div>
      {hasDelta && (
        <span className="text-xs font-medium" style={{ color: deltaColor }} data-testid={`${testId}-delta`}>
          {positive ? '▲ +' : '▼ '}
          {Math.abs((delta as number) * 100).toFixed(1)}% vs. previous
        </span>
      )}
    </div>
  );
}
