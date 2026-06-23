import { useEffect, useState } from 'react';
import { SlideOverDrawer } from '../components/SlideOverDrawer';
import { Field, controlClass, baseControl } from '../components/Field';
import { Button } from '../components/Button';
import type { Channel } from '../types';

const CHANNELS: Channel[] = ['email', 'sms', 'in_app', 'link'];

/**
 * Send-invitation drawer. Supports a small bulk paste — one recipient per line.
 * Each recipient is sent individually through the parent's onSend (the BE send
 * is idempotent per tenant+recipient+context_ref). Per-recipient failures are
 * surfaced via the parent's toast, not swallowed.
 */
export function SendInvitationDrawer({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (payload: {
    recipient: string;
    channel: string;
    role: string | null;
    context_ref: string | null;
  }) => Promise<boolean>;
}) {
  const [recipients, setRecipients] = useState('');
  const [channel, setChannel] = useState<Channel>('email');
  const [role, setRole] = useState('');
  const [contextRef, setContextRef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setRecipients('');
      setChannel('email');
      setRole('');
      setContextRef('');
      setError(null);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const list = recipients
      .split(/[\n,;]+/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setError('Enter at least one recipient.');
      return;
    }
    setError(null);
    setBusy(true);
    let allOk = true;
    for (const recipient of list) {
      const ok = await onSend({
        recipient,
        channel,
        role: role || null,
        context_ref: contextRef || null,
      });
      allOk = allOk && ok;
    }
    setBusy(false);
    if (allOk) onClose();
  }

  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      testId="invitation-drawer"
      title="Send invitation"
      description="One recipient per line for a small batch send."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} data-testid="invitation-drawer-cancel">
            Cancel
          </Button>
          <Button type="submit" form="send-invitation-form" data-testid="invitation-drawer-send" disabled={busy}>
            {busy ? 'Sending…' : 'Send'}
          </Button>
        </>
      }
    >
      <form id="send-invitation-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label="Recipients"
          name="recipient"
          required
          error={error ?? undefined}
          hint="One email per line (or comma-separated)."
        >
          {(id, db) => (
            <textarea
              id={id}
              aria-describedby={db}
              data-testid="invitation-field-recipients"
              className={controlClass('min-h-[96px] font-mono text-sm')}
              style={baseControl}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder={'alice@acme.com\nbob@acme.com'}
              required
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Channel" name="channel">
            {(id) => (
              <select
                id={id}
                data-testid="invitation-field-channel"
                className={controlClass()}
                style={baseControl}
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Role" name="role" hint="Optional role hint for the redeemer.">
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                data-testid="invitation-field-role"
                className={controlClass()}
                style={baseControl}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label="Context ref" name="context_ref" hint="Optional idempotency / attribution key.">
          {(id, db) => (
            <input
              id={id}
              aria-describedby={db}
              data-testid="invitation-field-context"
              className={controlClass()}
              style={baseControl}
              value={contextRef}
              onChange={(e) => setContextRef(e.target.value)}
            />
          )}
        </Field>
      </form>
    </SlideOverDrawer>
  );
}
