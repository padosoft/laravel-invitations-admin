import { useState } from 'react';
import { Icon } from './Icon';

/**
 * Chips input for free-form string lists (project keys, scope globs, blocklists)
 * in the Padosoft DC scope-editor look. Enter or comma commits a chip;
 * Backspace on an empty field removes the last. The text input carries a real
 * aria-label passed by the caller.
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
      data-testid={testId}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}
    >
      {values.map((v) => (
        <span
          key={v}
          data-testid={`${testId}-chip-${v}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 6px 5px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--cyan-a14)',
            border: '1px solid var(--cyan-a40)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--accent-ink)',
          }}
        >
          {v}
          <button
            type="button"
            onClick={() => remove(v)}
            aria-label={`Remove ${v}`}
            data-testid={`${testId}-chip-${v}-remove`}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 16,
              height: 16,
              border: 'none',
              background: 'var(--bg-elevated)',
              borderRadius: 99,
              color: 'var(--text-low)',
              cursor: 'pointer',
            }}
          >
            <Icon name="x" size={12} />
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
        style={{
          flex: 1,
          minWidth: 120,
          height: 30,
          padding: '0 10px',
          background: 'var(--bg-inset)',
          border: '1px dashed var(--line-2)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--text-hi)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
          outline: 'none',
        }}
      />
    </div>
  );
}
