import type { InviteGrant, TenantGrant, ProjectRole, Tenant } from '../types';
import { Field, controlClass, baseControl } from './Field';
import { ChipsInput } from './ChipsInput';
import { Icon } from './Icon';

/**
 * Grant editor — a primary grant (applied on the redemption tenant) plus zero
 * or more additional per-tenant grants, so one code can seed access across
 * several tenants. Controlled: holds no internal state, lifts every change to
 * the parent via onChange (R29 — stateless controlled component).
 *
 * `super-admin` is intentionally absent from the role options (the BE rejects
 * it; we never offer it).
 */
const PROJECT_ROLES: ProjectRole[] = ['member', 'admin', 'owner'];

export function emptyGrant(): InviteGrant {
  return { role: null, projects: [], project_role: 'member', scope_allowlist: null, tenants: [] };
}

function scopeToChips(scope: Record<string, unknown> | null | undefined): string[] {
  if (!scope) return [];
  const raw = (scope as { globs?: unknown }).globs;
  return Array.isArray(raw) ? raw.map(String) : [];
}

function chipsToScope(chips: string[]): Record<string, unknown> | null {
  return chips.length ? { globs: chips } : null;
}

export function GrantEditor({
  value,
  onChange,
  roleOptions,
  tenantOptions,
}: {
  value: InviteGrant;
  onChange: (next: InviteGrant) => void;
  roleOptions: string[];
  tenantOptions: Tenant[];
}) {
  const tenants = value.tenants ?? [];

  function patch(p: Partial<InviteGrant>) {
    onChange({ ...value, ...p });
  }

  function addTenantGrant() {
    const used = new Set(tenants.map((t) => t.tenant_id));
    const next = tenantOptions.find((t) => !used.has(t.id))?.id ?? tenantOptions[0]?.id ?? '';
    patch({
      tenants: [
        ...tenants,
        { tenant_id: next, role: null, projects: [], project_role: 'member', scope_allowlist: null },
      ],
    });
  }

  function patchTenant(index: number, p: Partial<TenantGrant>) {
    patch({ tenants: tenants.map((t, i) => (i === index ? { ...t, ...p } : t)) });
  }

  function removeTenant(index: number) {
    patch({ tenants: tenants.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-4" data-testid="grant-editor">
      {/* Primary grant card */}
      <section
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        data-testid="grant-editor-primary"
      >
        <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Primary grant
          <span className="ml-2 font-normal" style={{ color: 'var(--color-text-muted)' }}>
            applied on the redemption tenant
          </span>
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Role" name="grant-role">
            {(id) => (
              <select
                id={id}
                data-testid="grant-primary-role"
                className={controlClass()}
                style={baseControl}
                value={value.role ?? ''}
                onChange={(e) => patch({ role: e.target.value || null })}
              >
                <option value="">— none —</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Project role" name="grant-project-role">
            {(id) => (
              <select
                id={id}
                data-testid="grant-primary-project-role"
                className={controlClass()}
                style={baseControl}
                value={value.project_role}
                onChange={(e) => patch({ project_role: e.target.value as ProjectRole })}
              >
                {PROJECT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Projects" name="grant-projects" hint="Project keys this code grants access to.">
            {() => (
              <ChipsInput
                values={value.projects}
                onChange={(projects) => patch({ projects })}
                ariaLabel="Primary grant projects"
                placeholder="add project key…"
                testId="grant-primary-projects"
              />
            )}
          </Field>
        </div>
        <div className="mt-3">
          <Field
            label="Scope allowlist"
            name="grant-scope"
            hint="Optional folder globs / tags restricting the grant."
          >
            {() => (
              <ChipsInput
                values={scopeToChips(value.scope_allowlist)}
                onChange={(chips) => patch({ scope_allowlist: chipsToScope(chips) })}
                ariaLabel="Primary grant scope allowlist"
                placeholder="e.g. hr/policies/*"
                testId="grant-primary-scope"
              />
            )}
          </Field>
        </div>
      </section>

      {/* Additional tenant grants */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Additional tenant grants
            <span className="ml-2 font-normal" style={{ color: 'var(--color-text-muted)' }}>
              ({tenants.length})
            </span>
          </h4>
          <button
            type="button"
            data-testid="grant-tenant-add"
            onClick={addTenantGrant}
            disabled={tenantOptions.length === 0}
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
          >
            <Icon name="plus" size={14} />
            Add tenant grant
          </button>
        </div>

        {tenants.map((tg, index) => (
          <div
            key={index}
            data-testid={`grant-tenant-${index}`}
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <Field label="Tenant" name={`grant-tenant-${index}-id`}>
                {(id) => (
                  <select
                    id={id}
                    data-testid={`grant-tenant-${index}-tenant`}
                    className={controlClass()}
                    style={baseControl}
                    value={tg.tenant_id}
                    onChange={(e) => patchTenant(index, { tenant_id: e.target.value })}
                  >
                    {tenantOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <button
                type="button"
                data-testid={`grant-tenant-${index}-remove`}
                onClick={() => removeTenant(index)}
                aria-label={`Remove tenant grant ${index + 1}`}
                className="mt-6 rounded-md p-1.5 hover:opacity-70"
                style={{ color: 'var(--color-danger)' }}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Role" name={`grant-tenant-${index}-role`}>
                {(id) => (
                  <select
                    id={id}
                    data-testid={`grant-tenant-${index}-role`}
                    className={controlClass()}
                    style={baseControl}
                    value={tg.role ?? ''}
                    onChange={(e) => patchTenant(index, { role: e.target.value || null })}
                  >
                    <option value="">— none —</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Project role" name={`grant-tenant-${index}-project-role`}>
                {(id) => (
                  <select
                    id={id}
                    data-testid={`grant-tenant-${index}-project-role`}
                    className={controlClass()}
                    style={baseControl}
                    value={tg.project_role}
                    onChange={(e) => patchTenant(index, { project_role: e.target.value as ProjectRole })}
                  >
                    {PROJECT_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Projects" name={`grant-tenant-${index}-projects`}>
                {() => (
                  <ChipsInput
                    values={tg.projects}
                    onChange={(projects) => patchTenant(index, { projects })}
                    ariaLabel={`Tenant grant ${index + 1} projects`}
                    placeholder="add project key…"
                    testId={`grant-tenant-${index}-projects`}
                  />
                )}
              </Field>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
