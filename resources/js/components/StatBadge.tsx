import type { ReactNode } from 'react';
import { badgeStyle, type Tone } from './ds';

// Status badges pair a color token with text (never color-alone — §5 a11y).
// Variants map onto the Padosoft DS tone palette.
export type BadgeVariant = Tone;

export function StatBadge({
  variant = 'neutral',
  children,
  testId,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <span data-testid={testId} style={badgeStyle(variant)}>
      {children}
    </span>
  );
}
