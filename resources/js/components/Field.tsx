import { useId, type ReactNode } from 'react';

/**
 * Labeled form field wrapper. Always binds a real <label htmlFor> to the child
 * control (a11y §5 — placeholder is not a label) and renders the per-field
 * error with the `{name}-error` testid (R11) when present.
 */
export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Receives the generated id to bind to the control. */
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const errorId = error ? `${id}-err` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>
            {' '}
            *
          </span>
        )}
      </label>
      {children(id, describedBy)}
      {hint && (
        <p id={hintId} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          data-testid={`${name}-error`}
          role="alert"
          className="text-xs font-medium"
          style={{ color: 'var(--color-danger)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

const baseControl: React.CSSProperties = {
  borderColor: 'var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
};

export function controlClass(extra = ''): string {
  return `w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-primary)] ${extra}`;
}

export { baseControl };
