import { useState } from 'react';
import { Icon } from './Icon';

/**
 * Chips input for free-form string lists (project keys, scope globs, blocklists).
 * Enter or comma commits a chip; Backspace on an empty field removes the last.
 * The text input carries a real label via aria-label passed by the caller.
 */
export function ChipsInput({
  values,
  onChange,
  placeholder,
  ariaLabel,
  testId,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
  testId: string;
}) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const v = raw.trim();
    if (!v || values.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...values, v]);
    setDraft('');
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      data-testid={testId}
    >
      {values.map((v) => (
        <span
          key={v}
          data-testid={`${testId}-chip-${v}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
        >
          {v}
          <button
            type="button"
            onClick={() => remove(v)}
            aria-label={`Remove ${v}`}
            data-testid={`${testId}-chip-${v}-remove`}
            className="hover:opacity-70"
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        aria-label={ariaLabel}
        placeholder={placeholder}
        data-testid={`${testId}-input`}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit(draft);
          } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
            remove(values[values.length - 1]);
          }
        }}
        onBlur={() => draft && commit(draft)}
        className="min-w-[8ch] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
        style={{ color: 'var(--color-text)' }}
      />
    </div>
  );
}
