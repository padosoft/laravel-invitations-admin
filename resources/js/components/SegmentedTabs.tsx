export interface SegmentTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Segmented filter tabs (e.g. Invitations status). role=tablist with
 * aria-selected on the focusable <button> (§5 — not on a wrapper).
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  testId,
  ariaLabel,
}: {
  tabs: SegmentTab<T>[];
  value: T;
  onChange: (next: T) => void;
  testId: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-testid={testId}
      className="inline-flex flex-wrap gap-1 rounded-lg border p-1"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`${testId}-${tab.value}`}
            onClick={() => onChange(tab.value)}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: active ? 'var(--color-surface)' : 'transparent',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: active ? 'var(--shadow-card)' : 'none',
            }}
          >
            {tab.label}
            {tab.count != null && (
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
