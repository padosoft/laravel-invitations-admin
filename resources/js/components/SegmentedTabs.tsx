export interface SegmentTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Segmented filter tabs (e.g. Invitations status), Padosoft DC look. role=tablist
 * with aria-selected on the focusable <button> (§5 — not on a wrapper).
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
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: 4,
        background: 'var(--bg-inset)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)',
      }}
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 13px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              background: active ? 'var(--cyan-a08)' : 'transparent',
              color: active ? 'var(--accent-ink)' : 'var(--text-low)',
              boxShadow: active ? 'inset 0 0 0 1px var(--cyan-a24)' : 'none',
            }}
          >
            {tab.label}
            {tab.count != null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: active ? 'var(--cyan-a14)' : 'var(--bg-elevated)',
                  color: active ? 'var(--accent-ink)' : 'var(--text-faint)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
