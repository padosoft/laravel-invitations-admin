// Lightweight hand-rolled SVG charts (no charting library — keeps the bundle
// tiny and dependency-free; matches the Padosoft DC HUD look). Every reduction
// over a data array guards the empty case so we never emit Math.max(...[]) ===
// -Infinity into SVG coordinates (R14).

export interface SeriesPoint {
  label: string;
  value: number;
}

export function Sparkline({
  points,
  width = 76,
  height = 26,
  color = 'var(--cyan-500)',
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
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
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--line-2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          color: 'var(--text-low)',
        }}
      >
        No activity in the selected range.
      </div>
    );
  }

  const width = 720;
  const padding = 28;
  const max = Math.max(...series.map((s) => s.value), 1);
  const stepX = series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0;
  const gradId = `${testId}-area`;

  const coords = series.map((s, i) => ({
    x: padding + i * stepX,
    y: height - padding - (s.value / max) * (height - padding * 2),
    point: s,
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height - padding} L${coords[0].x.toFixed(1)},${height - padding} Z`;

  // Four horizontal grid lines for the HUD feel.
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((p) => padding + p * (height - padding * 2));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Invites and redemptions over time"
      data-testid={testId}
      preserveAspectRatio="none"
      style={{ width: '100%', height, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--cyan-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((y, i) => (
        <line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--line-faint)" strokeWidth={1} />
      ))}
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--cyan-500)"
        strokeWidth={2.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 6px var(--cyan-a40))' }}
      />
      {coords.map((c) => (
        <circle key={c.point.label} cx={c.x} cy={c.y} r={2.5} fill="var(--cyan-500)">
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

const STAGE_FILLS = [
  'linear-gradient(90deg, var(--blue-500), var(--blue-400))',
  'linear-gradient(90deg, var(--cyan-700), var(--cyan-500))',
  'linear-gradient(90deg, var(--cyan-600), var(--cyan-400))',
  'linear-gradient(90deg, #0f8f63, var(--success))',
];
const STAGE_DOTS = ['var(--blue-400)', 'var(--cyan-500)', 'var(--cyan-400)', 'var(--success)'];

export function FunnelChart({ stages, testId }: { stages: FunnelStage[]; testId: string }) {
  if (stages.length === 0) {
    return (
      <div
        data-testid={`${testId}-empty`}
        style={{
          border: '1px dashed var(--line-2)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-low)',
        }}
      >
        No funnel data yet.
      </div>
    );
  }
  const top = Math.max(stages[0].value, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid={testId}>
      {stages.map((stage, i) => {
        const pct = stage.value / top;
        const prev = i > 0 ? stages[i - 1].value : null;
        const dropoff = prev != null && prev > 0 ? ((prev - stage.value) / prev) * 100 : null;
        return (
          <div key={stage.label} data-testid={`${testId}-stage-${i}`}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-mid)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: STAGE_DOTS[i % STAGE_DOTS.length] }} />
                {stage.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-hi)', fontWeight: 600 }}>
                {stage.value.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 26, background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  width: `${Math.max(pct * 100, 4)}%`,
                  height: '100%',
                  background: STAGE_FILLS[i % STAGE_FILLS.length],
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 8,
                  minWidth: '2.5rem',
                  transition: 'width var(--dur-slow) var(--ease-out)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-on-accent)', fontWeight: 600 }}>
                  {(pct * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-faint)' }}>
              {dropoff != null ? `↓ ${dropoff.toFixed(0)}% drop-off from ${stages[i - 1].label.toLowerCase()}` : 'top of funnel'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
