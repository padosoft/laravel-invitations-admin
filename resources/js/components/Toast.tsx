import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

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

const KIND: Record<ToastKind, { accent: string; tint: string; icon: IconName }> = {
  success: { accent: 'var(--success)', tint: 'rgba(47,245,168,0.14)', icon: 'check' },
  error: { accent: 'var(--danger)', tint: 'rgba(255,92,122,0.14)', icon: 'alert' },
  info: { accent: 'var(--cyan-500)', tint: 'var(--cyan-a14)', icon: 'sparkles' },
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
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        data-testid="toast-region"
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 340,
          maxWidth: 'calc(100vw - 2rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const s = KIND[t.kind];
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              data-testid={`toast-${t.kind}`}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                gap: 11,
                padding: '13px 13px 13px 14px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--line-2)',
                borderLeft: `2px solid ${s.accent}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-pop)',
                animation: 'pds-rise var(--dur-base) var(--ease-out) both',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.accent,
                  background: s.tint,
                }}
              >
                <Icon name={s.icon} size={14} />
              </span>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: 'var(--text-mid)' }}>{t.message}</div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Dismiss notification"
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  borderRadius: 5,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
