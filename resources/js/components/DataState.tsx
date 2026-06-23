import type { ReactNode } from 'react';
import { Icon } from './Icon';

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
          className="flex flex-col items-start gap-3 rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-danger)',
            backgroundColor: 'var(--color-danger-soft)',
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--color-danger)' }}>
            <Icon name="warning" size={18} />
            <span>Something went wrong</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            {error ?? 'Unable to load this data.'}
          </p>
          {onRetry && (
            <button
              type="button"
              data-testid={`${testId}-retry`}
              onClick={onRetry}
              className="rounded-md px-3 py-1.5 text-sm font-medium"
              style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {state === 'empty' && (
        <div
          data-testid={`${testId}-empty`}
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          {empty}
        </div>
      )}
      {state === 'ready' && children}
    </div>
  );
}
