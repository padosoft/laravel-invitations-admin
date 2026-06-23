// Lightweight hand-rolled SVG charts (no charting library — keeps the bundle
// tiny and dependency-free; the design brief permits simple SVG). Every
// reduction over a data array guards the empty case so we never emit
// Math.max(...[]) === -Infinity into SVG coordinates (R14).

export interface SeriesPoint {
  label: string;
  value: number;
}

export function Sparkline({
  points,
  width = 120,
  height = 32,
  color = 'var(--color-primary)',
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / span) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

export function TimeSeriesChart({
  series,
  testId,
  height = 220,
}: {
  series: SeriesPoint[];
  testId: string;
  height?: number;
}) {
  if (series.length === 0) {
    return (
      <div
        data-testid={`${testId}-empty`}
        className="flex items-center justify-center rounded-lg border border-dashed text-sm"
        style={{ height, borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        No activity in the selected range.
      </div>
    );
  }

  const width = 720;
  const padding = 28;
  const max = Math.max(...series.map((s) => s.value), 1);
  const stepX = series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0;

  const coords = series.map((s, i) => ({
    x: padding + i * stepX,
    y: height - padding - (s.value / max) * (height - padding * 2),
    point: s,
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height - padding} L${coords[0].x.toFixed(1)},${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Redemptions over time"
      data-testid={testId}
      className="w-full"
      style={{ height }}
    >
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="var(--color-border)"
      />
      <path d={area} fill="var(--color-primary-soft)" opacity={0.6} />
      <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" />
      {coords.map((c) => (
        <circle key={c.point.label} cx={c.x} cy={c.y} r={2.5} fill="var(--color-primary)">
          <title>{`${c.point.label}: ${c.point.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export interface FunnelStage {
  label: string;
  value: number;
}

export function FunnelChart({ stages, testId }: { stages: FunnelStage[]; testId: string }) {
  if (stages.length === 0) {
    return (
      <div
        data-testid={`${testId}-empty`}
        className="rounded-lg border border-dashed p-6 text-center text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        No funnel data yet.
      </div>
    );
  }
  const top = Math.max(stages[0].value, 1);
  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.value / top) * 100, 2);
        const prev = i > 0 ? stages[i - 1].value : null;
        const dropoff =
          prev != null && prev > 0 ? ((prev - stage.value) / prev) * 100 : null;
        return (
          <div key={stage.label} className="flex items-center gap-3" data-testid={`${testId}-stage-${i}`}>
            <span className="w-24 shrink-0 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {stage.label}
            </span>
            <div className="relative h-9 flex-1 overflow-hidden rounded-md" style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <div
                className="flex h-full items-center rounded-md px-3 text-sm font-medium text-white"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: 'var(--color-primary)',
                  minWidth: '2.5rem',
                }}
              >
                {stage.value.toLocaleString()}
              </div>
            </div>
            <span className="w-16 shrink-0 text-right text-xs" style={{ color: 'var(--color-warning)' }}>
              {dropoff != null ? `-${dropoff.toFixed(0)}%` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
