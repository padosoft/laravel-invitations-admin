import { useEffect, useState } from 'react';
import { SlideOverDrawer } from '../components/SlideOverDrawer';
import { Field, controlClass, baseControl } from '../components/Field';
import { Button } from '../components/Button';
import { CopyButton } from '../components/CopyButton';
import { generateCodes } from '../api/endpoints';
import { normalizeError } from '../api/client';
import { useToast } from '../components/Toast';
import type { InviteCampaign, InviteCode } from '../types';

/**
 * Generate-codes drawer. Campaign is optional (standalone codes allowed). After
 * a successful generation the codes are shown with copy-all + CSV export.
 */
export function GenerateCodesDrawer({
  open,
  campaigns,
  defaultCampaignId,
  onClose,
  onGenerated,
}: {
  open: boolean;
  campaigns: InviteCampaign[];
  defaultCampaignId: number | null;
  onClose: () => void;
  onGenerated: () => void;
}) {
  const toast = useToast();
  const [campaignId, setCampaignId] = useState<number | null>(defaultCampaignId);
  const [count, setCount] = useState('10');
  const [maxUses, setMaxUses] = useState('1');
  const [length, setLength] = useState('10');
  const [expiresAt, setExpiresAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState<InviteCode[]>([]);

  useEffect(() => {
    if (open) {
      setCampaignId(defaultCampaignId);
      setGenerated([]);
      setErrors({});
    }
  }, [open, defaultCampaignId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const codes = await generateCodes({
        campaign_id: campaignId,
        count: Number(count),
        max_uses: maxUses ? Number(maxUses) : null,
        length: length ? Number(length) : null,
        expires_at: expiresAt || null,
      });
      setGenerated(codes);
      toast.success(`Generated ${codes.length} code${codes.length === 1 ? '' : 's'}.`);
      onGenerated();
    } catch (err) {
      const n = normalizeError(err);
      setErrors(n.fields);
      toast.error(n.message);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const header = 'code,state,max_uses,expires_at\n';
    const body = generated
      .map((c) => `${c.code},${c.state},${c.max_uses},${c.expires_at ?? ''}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      testId="codes-drawer"
      title="Generate codes"
      description="Issue a batch of invite codes, optionally attached to a campaign."
      footer={
        generated.length === 0 ? (
          <>
            <Button variant="secondary" type="button" onClick={onClose} data-testid="codes-drawer-cancel">
              Cancel
            </Button>
            <Button type="submit" form="generate-codes-form" data-testid="codes-drawer-generate" disabled={busy}>
              {busy ? 'Generating…' : 'Generate'}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onClose} data-testid="codes-drawer-done">
            Done
          </Button>
        )
      }
    >
      {generated.length === 0 ? (
        <form id="generate-codes-form" onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Campaign" name="campaign_id" hint="Optional — leave blank for standalone codes.">
            {(id, db) => (
              <select
                id={id}
                aria-describedby={db}
                data-testid="codes-field-campaign"
                className={controlClass()}
                style={baseControl}
                value={campaignId ?? ''}
                onChange={(e) => setCampaignId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— standalone —</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Count" name="count" required error={errors.count}>
              {(id, db) => (
                <input
                  id={id}
                  aria-describedby={db}
                  type="number"
                  min={1}
                  max={1000}
                  data-testid="codes-field-count"
                  className={controlClass()}
                  style={baseControl}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                />
              )}
            </Field>
            <Field label="Max uses per code" name="max_uses" error={errors.max_uses}>
              {(id, db) => (
                <input
                  id={id}
                  aria-describedby={db}
                  type="number"
                  min={1}
                  data-testid="codes-field-max-uses"
                  className={controlClass()}
                  style={baseControl}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              )}
            </Field>
            <Field label="Code length" name="length" error={errors.length}>
              {(id, db) => (
                <input
                  id={id}
                  aria-describedby={db}
                  type="number"
                  min={4}
                  max={64}
                  data-testid="codes-field-length"
                  className={controlClass()}
                  style={baseControl}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              )}
            </Field>
            <Field label="Expiry" name="expires_at" error={errors.expires_at}>
              {(id, db) => (
                <input
                  id={id}
                  aria-describedby={db}
                  type="date"
                  data-testid="codes-field-expires"
                  className={controlClass()}
                  style={baseControl}
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              )}
            </Field>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4" data-testid="codes-generated-result">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {generated.length} code{generated.length === 1 ? '' : 's'} generated
            </p>
            <div className="flex gap-2">
              <CopyButton
                value={generated.map((c) => c.code).join('\n')}
                label="Copy all"
                testId="codes-generated-copy-all"
              />
              <Button variant="secondary" type="button" onClick={exportCsv} data-testid="codes-generated-export">
                Export CSV
              </Button>
            </div>
          </div>
          <ul
            className="flex flex-col divide-y rounded-md border"
            style={{ borderColor: 'var(--color-border)' }}
            data-testid="codes-generated-list"
          >
            {generated.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-mono text-sm">{c.code}</span>
                <CopyButton value={c.code} testId={`codes-generated-${c.id}-copy`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </SlideOverDrawer>
  );
}
