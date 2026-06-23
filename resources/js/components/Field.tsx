import { useId, type CSSProperties, type ReactNode } from 'react';
import { fLabel } from './ds';

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
      <label htmlFor={id} style={fLabel}>
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--danger)' }}>
            {' '}
            *
          </span>
        )}
      </label>
      {children(id, describedBy)}
      {hint && (
        <p id={hintId} className="text-xs" style={{ color: 'var(--text-low)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          data-testid={`${name}-error`}
          role="alert"
          style={{ fontSize: 11.5, color: 'var(--danger)', fontWeight: 500 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Padosoft DS control surface (HUD inset well). Works for <input>, <select> and
 * <textarea>; selects render their own chevron, textareas grow via min-h utils.
 */
const baseControl: CSSProperties = {
  width: '100%',
  minHeight: 38,
  padding: '8px 12px',
  background: 'var(--bg-inset)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-hi)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13.5,
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
};

export function controlClass(extra = ''): string {
  // Visuals come from `style={baseControl}`; this only forwards layout utils.
  return ['outline-none', extra].filter(Boolean).join(' ');
}

export { baseControl };
