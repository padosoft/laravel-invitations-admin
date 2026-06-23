import { maskEmail } from '../lib/format';

/**
 * Renders a masked email. The visible text is masked; the full address is kept
 * out of the DOM text node by default. We expose it only via title for operator
 * hover — never auto-render full PII.
 */
export function MaskedEmail({ email, testId }: { email: string; testId?: string }) {
  return (
    <span data-testid={testId} title={email} className="font-mono text-sm">
      {maskEmail(email)}
    </span>
  );
}
