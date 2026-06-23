import type { ReactNode } from 'react';

// Status badges pair a color token with text (never color-alone — §5 a11y).
export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_STYLE: Record<BadgeVariant, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--color-neutral-soft)', fg: 'var(--color-text-muted)' },
  primary: { bg: 'var(--color-primary-soft)', fg: 'var(--color-primary)' },
  success: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-soft)', fg: 'var(--color-warning)' },
  danger: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)' },
  info: { bg: 'var(--color-info-soft)', fg: 'var(--color-info)' },
};

export function StatBadge({
  variant = 'neutral',
  children,
  testId,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  testId?: string;
}) {
  const s = VARIANT_STYLE[variant];
  return (
    <span
      data-testid={testId}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {children}
    </span>
  );
}
