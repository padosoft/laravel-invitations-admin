import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { iconChip } from './ds';

export type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

/**
 * Universal async-state container (§4). Renders exactly one of
 * idle/loading/ready/error/empty and exposes `data-state` + `aria-busy` so
 * Playwright can wait on state transitions instead of timeouts. The error
 * message is rendered in the DOM (R14 — never a silent failure).
 */
export function DataState({
  state,
  testId,
  loading,
  empty,
  error,
  onRetry,
  children,
}: {
  state: LoadState;
  testId: string;
  loading: ReactNode;
  empty: ReactNode;
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}) {
  return (
    <div data-testid={testId} data-state={state} aria-busy={state === 'loading'}>
      {state === 'loading' && loading}
      {state === 'error' && (
        <div
          role="alert"
          data-testid={`${testId}-error`}
          className="flex flex-col items-center gap-3.5 text-center"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid rgba(255,92,122,0.28)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: '40px 24px',
          }}
        >
          <span
            style={{
              ...iconChip,
              width: 56,
              height: 56,
              borderRadius: 16,
              color: 'var(--danger)',
              background: 'var(--danger-dim)',
              border: '1px solid rgba(255,92,122,0.3)',
            }}
          >
            <Icon name="alert" size={24} />
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-hi)' }}>
              Couldn&rsquo;t load this data
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-low)', marginTop: 4, maxWidth: 340 }}>
              {error ?? 'The request failed. The error is shown here, never swallowed.'}
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              data-testid={`${testId}-retry`}
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 36,
                padding: '0 13px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line-2)',
                cursor: 'pointer',
                background: 'var(--bg-raised)',
                color: 'var(--text-mid)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Icon name="rotate" size={14} /> Retry
            </button>
          )}
        </div>
      )}
      {state === 'empty' && (
        <div
          data-testid={`${testId}-empty`}
          className="flex flex-col items-center gap-3.5 text-center"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--line-1)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: '40px 24px',
            color: 'var(--text-low)',
          }}
        >
          {empty}
        </div>
      )}
      {state === 'ready' && children}
    </div>
  );
}

/** A cyan icon chip + display heading + body, for the empty-state slot. */
export function EmptyState({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <>
      <span style={{ ...iconChip, width: 56, height: 56, borderRadius: 16 }}>
        <Icon name="megaphone" size={24} />
      </span>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-hi)' }}>
          {heading}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-low)', marginTop: 4, maxWidth: 320 }}>{body}</div>
      </div>
      {children}
    </>
  );
}
