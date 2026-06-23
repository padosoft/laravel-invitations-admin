import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const KIND_STYLE: Record<ToastKind, { border: string; fg: string }> = {
  success: { border: 'var(--color-success)', fg: 'var(--color-success)' },
  error: { border: 'var(--color-danger)', fg: 'var(--color-danger)' },
  info: { border: 'var(--color-info)', fg: 'var(--color-info)' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((cur) => [...cur, { id, kind, message }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        data-testid="toast-region"
      >
        {toasts.map((t) => {
          const s = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              data-testid={`toast-${t.kind}`}
              className="pointer-events-auto flex items-start gap-2 rounded-lg border-l-4 px-3 py-2.5 text-sm shadow-lg"
              style={{
                borderColor: s.border,
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                animation: 'ia-fade-in 0.2s ease-out',
              }}
            >
              <span style={{ color: s.fg }} className="mt-0.5 shrink-0">
                <Icon name={t.kind === 'error' ? 'warning' : 'check'} size={16} />
              </span>
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
