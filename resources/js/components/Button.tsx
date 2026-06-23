import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { primaryBtn, ghostBtn, dangerBtn } from './ds';

type Variant = 'primary' | 'secondary' | 'danger';

const VARIANT: Record<Variant, CSSProperties> = {
  primary: primaryBtn,
  secondary: ghostBtn,
  danger: dangerBtn,
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', style, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={className}
      style={{ ...VARIANT[variant], ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : null), ...style }}
    >
      {children}
    </button>
  );
}
