import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Centered confirmation modal for destructive actions. Esc cancels, focus is
 * trapped, the confirm button is styled by `tone`. Optional `body` slot lets a
 * caller add e.g. a reason field (reward reversal).
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  testId,
  body,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  testId: string;
  body?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onCancel]);

  if (!open) return null;

  const titleId = `${testId}-title`;
  const accent = tone === 'danger' ? 'var(--color-danger)' : 'var(--color-primary)';

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" data-testid={`${testId}-overlay`}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        className="relative w-full max-w-md rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-drawer)',
        }}
      >
        <h2 id={titleId} className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
        <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {message}
        </div>
        {body && <div className="mt-4">{body}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            data-testid={`${testId}-cancel`}
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            data-testid={`${testId}-confirm`}
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
