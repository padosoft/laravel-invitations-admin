import { useState } from 'react';
import { Icon } from './Icon';
import { ghostBtn } from './ds';

/**
 * Copy-to-clipboard button with a transient "copied" confirmation (Padosoft DC
 * look). Icon-only callers still get an aria-label (§5). Falls back gracefully
 * where the Clipboard API is unavailable — the failure is surfaced via the
 * label/title, never silently swallowed.
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
      style={{
        ...ghostBtn,
        height: 30,
        padding: '0 10px',
        fontSize: 12,
        color: copied ? 'var(--success)' : 'var(--text-mid)',
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      <span>{copied ? 'Copied' : failed ? 'Failed' : label}</span>
    </button>
  );
}
