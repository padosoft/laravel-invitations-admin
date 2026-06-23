import { Sparkline } from './charts';
import { Icon, type IconName } from './Icon';
import { iconChip } from './ds';

/**
 * KPI card (Padosoft DC look): icon chip + mono label + display-size value,
 * optional delta vs. previous period (arrow + sign text, not color-only) and
 * an optional right-aligned sparkline.
 */
export function KpiCard({
  label,
  value,
  delta,
  spark,
  icon,
  testId,
}: {
  label: string;
  value: string;
  /** Fractional change vs. previous period, e.g. 0.12 = +12%. */
  delta?: number | null;
  spark?: number[];
  icon?: IconName;
  testId: string;
}) {
  const hasDelta = delta != null && Number.isFinite(delta);
  const positive = hasDelta && (delta as number) >= 0;
  const deltaColor = positive ? 'var(--success)' : 'var(--danger)';

  return (
    <div
      data-testid={testId}
      style={{
        position: 'relative',
        padding: '16px 16px 14px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--grad-edge)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <span style={{ ...iconChip, width: 28, height: 28, borderRadius: 8 }}>
              <Icon name={icon} size={15} />
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-low)',
            }}
          >
            {label}
          </span>
        </span>
        {hasDelta && (
          <span
            data-testid={`${testId}-delta`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: deltaColor }}
          >
            <Icon name={positive ? 'trendUp' : 'trendDown'} size={12} />
            {positive ? '+' : ''}
            {Math.abs((delta as number) * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
        <span
          data-testid={`${testId}-value`}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, letterSpacing: '-0.02em', color: 'var(--text-hi)', lineHeight: 1 }}
        >
          {value}
        </span>
        {spark && spark.length > 1 && (
          <Sparkline points={spark} color={positive ? 'var(--cyan-500)' : 'var(--danger)'} />
        )}
      </div>
    </div>
  );
}
