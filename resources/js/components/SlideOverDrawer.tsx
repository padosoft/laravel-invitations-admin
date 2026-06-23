import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { iconBtnSm } from './ds';

/**
 * Right slide-over drawer (Padosoft DC look). Esc closes; focus is trapped while
 * open and restored to the trigger on close. Backdrop click closes.
 * role=dialog + aria-modal.
 */
export function SlideOverDrawer({
  open,
  onClose,
  title,
  description,
  testId,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  testId: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Move focus into the panel.
    const focusable = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = `${testId}-title`;
  const descId = description ? `${testId}-desc` : undefined;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100 }} data-testid={`${testId}-overlay`}>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2,3,7,0.58)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          animation: 'ig-fade var(--dur-base) var(--ease-out) both',
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-testid={testId}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(640px, 95vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--line-2)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'ig-slide var(--dur-base) var(--ease-out) both',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 20px',
            borderBottom: '1px solid var(--line-1)',
            background: 'var(--bg-raised)',
          }}
        >
          <div>
            <h2
              id={titleId}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--text-hi)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {description && (
              <p id={descId} style={{ fontSize: 12.5, color: 'var(--text-low)', marginTop: 2, marginBottom: 0 }}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid={`${testId}-close`}
            style={{ ...iconBtnSm, width: 34, height: 34 }}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>

        {footer && (
          <footer
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '14px 20px',
              borderTop: '1px solid var(--line-1)',
              background: 'var(--bg-raised)',
            }}
          >
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
