import { useState } from 'react';
import { Icon } from './Icon';

/**
 * Copy-to-clipboard button with a transient "copied" confirmation. Icon-only,
 * so it carries an aria-label (§5). Falls back gracefully where the Clipboard
 * API is unavailable (older browsers / insecure context) — the failure is
 * surfaced via the title, never silently swallowed.
 */
export function CopyButton({
  value,
  label = 'Copy',
  testId,
}: {
  value: string;
  label?: string;
  testId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onCopy() {
    setFailed(false);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onCopy}
      aria-label={copied ? `${label} — copied` : label}
      title={failed ? 'Copy failed — copy manually' : label}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:opacity-80"
      style={{
        borderColor: 'var(--color-border)',
        color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      <span>{copied ? 'Copied' : failed ? 'Failed' : label}</span>
    </button>
  );
}
