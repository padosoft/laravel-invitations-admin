import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { ghostBtn, primaryBtn, dangerBtn, iconChip } from './ds';

/**
 * Centered confirmation modal for destructive actions (Padosoft DC look). Esc
 * cancels, focus is trapped, the confirm button is styled by `tone`. Optional
 * `body` slot lets a caller add e.g. a reason field (reward reversal).
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
  const isDanger = tone === 'danger';

  return (
    <div
      role="presentation"
      data-testid={`${testId}-overlay`}
      style={{ position: 'fixed', inset: 0, zIndex: 1110, display: 'grid', placeItems: 'center', padding: 20 }}
    >
      <div
        onClick={onCancel}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2,3,7,0.62)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          animation: 'ig-fade var(--dur-fast) var(--ease-out) both',
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        style={{
          position: 'relative',
          width: 'min(440px, 100%)',
          background: 'var(--bg-raised)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: 22,
          animation: 'ig-pop var(--dur-base) var(--ease-out) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 16 }}>
          <span
            style={{
              ...iconChip,
              flexShrink: 0,
              width: 38,
              height: 38,
              borderRadius: 10,
              color: isDanger ? 'var(--danger)' : 'var(--accent-ink)',
              background: isDanger ? 'var(--danger-dim)' : 'var(--cyan-a08)',
              border: isDanger ? '1px solid rgba(255,92,122,0.3)' : '1px solid var(--cyan-a14)',
            }}
          >
            <Icon name={isDanger ? 'alert' : 'check'} size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <h2
              id={titleId}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-hi)', margin: 0 }}
            >
              {title}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 5, lineHeight: 1.5 }}>{message}</div>
          </div>
        </div>
        {body && <div style={{ marginBottom: 16 }}>{body}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            data-testid={`${testId}-cancel`}
            onClick={onCancel}
            disabled={busy}
            style={{ ...ghostBtn, opacity: busy ? 0.5 : 1 }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            data-testid={`${testId}-confirm`}
            onClick={onConfirm}
            disabled={busy}
            style={{ ...(isDanger ? dangerBtn : primaryBtn), opacity: busy ? 0.5 : 1 }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
