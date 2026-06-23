import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Right slide-over drawer. Esc closes; focus is trapped while open and restored
 * to the trigger on close. Backdrop click closes. role=dialog + aria-modal.
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
    <div className="fixed inset-0 z-50 flex justify-end" data-testid={`${testId}-overlay`}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-testid={testId}
        className="relative flex h-full w-full max-w-xl flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-drawer)',
          animation: 'ia-slide-in 0.22s ease-out',
        }}
      >
        <header
          className="flex items-start justify-between gap-4 border-b px-6 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 id={titleId} className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid={`${testId}-close`}
            className="rounded-md p-1.5 hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer
            className="flex items-center justify-end gap-3 border-t px-6 py-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
