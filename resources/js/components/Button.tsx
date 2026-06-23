import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)' },
  secondary: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' },
  danger: { backgroundColor: 'var(--color-danger)', color: '#fff' },
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const border = variant === 'secondary' ? 'border' : '';
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${border} ${className}`}
      style={VARIANT[variant]}
    >
      {children}
    </button>
  );
}
