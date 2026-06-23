import { useEffect, useState } from 'react';
import { SlideOverDrawer } from '../components/SlideOverDrawer';
import { Field, controlClass, baseControl } from '../components/Field';
import { GrantEditor, emptyGrant } from '../components/GrantEditor';
import { Button } from '../components/Button';
import { createCampaign, updateCampaign } from '../api/endpoints';
import { normalizeError } from '../api/client';
import { useToast } from '../components/Toast';
import type { InviteCampaign, CampaignType, CampaignStatus, InviteGrant, Tenant } from '../types';

const TYPES: CampaignType[] = ['single_use', 'multi_use', 'capacity', 'referral', 'waitlist_skip'];
const STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'ended'];

interface FormState {
  key: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  max_redemptions_total: string;
  per_user_limit: string;
  starts_at: string;
  ends_at: string;
  grant: InviteGrant;
}

function toForm(c: InviteCampaign | null): FormState {
  return {
    key: c?.key ?? '',
    name: c?.name ?? '',
    description: c?.description ?? '',
    type: c?.type ?? 'single_use',
    status: c?.status ?? 'draft',
    max_redemptions_total: c?.max_redemptions_total != null ? String(c.max_redemptions_total) : '',
    per_user_limit: c?.per_user_limit != null ? String(c.per_user_limit) : '1',
    starts_at: c?.starts_at ? c.starts_at.slice(0, 10) : '',
    ends_at: c?.ends_at ? c.ends_at.slice(0, 10) : '',
    grant: c?.grant ?? emptyGrant(),
  };
}

/**
 * Create/edit campaign drawer. `key` is immutable on edit (the slug anchor).
 * On create POSTs the full payload incl. the grant; on edit PATCHes the mutable
 * subset. Validation errors from the BE are mapped to per-field `{field}-error`.
 */
export function CampaignDrawer({
  open,
  campaign,
  roleOptions,
  tenantOptions,
  onClose,
  onSaved,
}: {
  open: boolean;
  campaign: InviteCampaign | null;
  roleOptions: string[];
  tenantOptions: Tenant[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = campaign !== null;
  const [form, setForm] = useState<FormState>(() => toForm(campaign));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Re-seed the form whenever the drawer opens for a different record.
  useEffect(() => {
    if (open) {
      setForm(toForm(campaign));
      setErrors({});
    }
  }, [open, campaign]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload(): Record<string, unknown> {
    const base: Record<string, unknown> = {
      name: form.name,
      description: form.description || null,
      status: form.status,
      max_redemptions_total: form.max_redemptions_total ? Number(form.max_redemptions_total) : null,
      per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : 1,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      grant: form.grant,
    };
    if (!isEdit) {
      base.key = form.key;
      base.type = form.type;
    }
    return base;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateCampaign(campaign.id, buildPayload());
        toast.success('Campaign updated.');
      } else {
        await createCampaign(buildPayload());
        toast.success('Campaign created.');
      }
      onSaved();
      onClose();
    } catch (err) {
      const n = normalizeError(err);
      setErrors(n.fields);
      toast.error(n.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      testId="campaign-drawer"
      title={isEdit ? `Edit campaign — ${campaign.name}` : 'New campaign'}
      description="Define the campaign, its schedule, and the access it grants on redemption."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} data-testid="campaign-drawer-cancel">
            Cancel
          </Button>
          <Button type="submit" form="campaign-form" data-testid="campaign-drawer-save" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create campaign'}
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Key" name="key" required error={errors.key} hint={isEdit ? 'Immutable after creation.' : 'Lowercase slug: a-z, 0-9, hyphen.'}>
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                data-testid="campaign-field-key"
                className={controlClass()}
                style={baseControl}
                value={form.key}
                disabled={isEdit}
                onChange={(e) => set('key', e.target.value)}
                required
              />
            )}
          </Field>
          <Field label="Name" name="name" required error={errors.name}>
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                data-testid="campaign-field-name"
                className={controlClass()}
                style={baseControl}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            )}
          </Field>
        </div>

        <Field label="Description" name="description" error={errors.description}>
          {(id, db) => (
            <textarea
              id={id}
              aria-describedby={db}
              data-testid="campaign-field-description"
              className={controlClass('min-h-[72px]')}
              style={baseControl}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" name="type" error={errors.type} hint={isEdit ? 'Immutable after creation.' : undefined}>
            {(id, db) => (
              <select
                id={id}
                aria-describedby={db}
                data-testid="campaign-field-type"
                className={controlClass()}
                style={baseControl}
                value={form.type}
                disabled={isEdit}
                onChange={(e) => set('type', e.target.value as CampaignType)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Status" name="status" error={errors.status}>
            {(id, db) => (
              <select
                id={id}
                aria-describedby={db}
                data-testid="campaign-field-status"
                className={controlClass()}
                style={baseControl}
                value={form.status}
                onChange={(e) => set('status', e.target.value as CampaignStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Max redemptions total" name="max_redemptions_total" error={errors.max_redemptions_total} hint="Blank = unlimited.">
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                type="number"
                min={1}
                data-testid="campaign-field-max"
                className={controlClass()}
                style={baseControl}
                value={form.max_redemptions_total}
                onChange={(e) => set('max_redemptions_total', e.target.value)}
              />
            )}
          </Field>
          <Field label="Per-user limit" name="per_user_limit" error={errors.per_user_limit}>
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                type="number"
                min={1}
                data-testid="campaign-field-per-user"
                className={controlClass()}
                style={baseControl}
                value={form.per_user_limit}
                onChange={(e) => set('per_user_limit', e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Starts at" name="starts_at" error={errors.starts_at}>
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                type="date"
                data-testid="campaign-field-starts"
                className={controlClass()}
                style={baseControl}
                value={form.starts_at}
                onChange={(e) => set('starts_at', e.target.value)}
              />
            )}
          </Field>
          <Field label="Ends at" name="ends_at" error={errors.ends_at}>
            {(id, db) => (
              <input
                id={id}
                aria-describedby={db}
                type="date"
                data-testid="campaign-field-ends"
                className={controlClass()}
                style={baseControl}
                value={form.ends_at}
                onChange={(e) => set('ends_at', e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Access grant
          </h3>
          <GrantEditor
            value={form.grant}
            onChange={(grant) => set('grant', grant)}
            roleOptions={roleOptions}
            tenantOptions={tenantOptions}
          />
        </div>
      </form>
    </SlideOverDrawer>
  );
}
