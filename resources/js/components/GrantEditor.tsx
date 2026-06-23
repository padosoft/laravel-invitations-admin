import type { ReactNode } from 'react';
import type { InviteGrant, TenantGrant, ProjectRole, Tenant } from '../types';
import { Field, baseControl } from './Field';
import { ChipsInput } from './ChipsInput';
import { Icon } from './Icon';
import { ghostBtn } from './ds';

/**
 * Grant editor (Padosoft DC look) — a primary grant (applied on the redemption
 * tenant) plus zero or more additional per-tenant grants, so one code can seed
 * access across several tenants. Controlled: holds no internal state, lifts
 * every change to the parent via onChange (R29 — stateless controlled).
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

/** Select with the DC chevron overlay, bound to a Field-provided id. */
function Sel({
  id,
  testId,
  value,
  onChange,
  children,
}: {
  id: string;
  testId: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <select
        id={id}
        data-testid={testId}
        style={baseControl}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span style={{ position: 'absolute', right: 10, top: 11, pointerEvents: 'none', color: 'var(--text-low)' }}>
        <Icon name="chevDown" size={14} />
      </span>
    </span>
  );
}

const sectionLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--accent-ink)',
};

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
    <div data-testid="grant-editor">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={sectionLabel}>Grant editor</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-faint)' }}>
          access seeded on redemption
        </span>
      </div>

      {/* Primary grant card */}
      <section
        data-testid="grant-editor-primary"
        style={{
          padding: 16,
          background: 'var(--bg-raised)',
          border: '1px solid var(--cyan-a24)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--glow-inset)',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--cyan-500)', boxShadow: '0 0 8px var(--cyan-500)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: 'var(--text-hi)' }}>
            Primary grant
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginLeft: 'auto' }}>
            redemption tenant
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Role" name="grant-role">
            {(id) => (
              <Sel id={id} testId="grant-primary-role" value={value.role ?? ''} onChange={(v) => patch({ role: v || null })}>
                <option value="">— none —</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Sel>
            )}
          </Field>
          <Field label="Project role" name="grant-project-role">
            {(id) => (
              <Sel
                id={id}
                testId="grant-primary-project-role"
                value={value.project_role}
                onChange={(v) => patch({ project_role: v as ProjectRole })}
              >
                {PROJECT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Sel>
            )}
          </Field>
        </div>
        <div style={{ marginTop: 14 }}>
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
        <div style={{ marginTop: 14 }}>
          <Field
            label="Scope allowlist"
            name="grant-scope"
            hint="Optional folder globs / tags · Enter to add."
          >
            {() => (
              <ChipsInput
                values={scopeToChips(value.scope_allowlist)}
                onChange={(chips) => patch({ scope_allowlist: chipsToScope(chips) })}
                ariaLabel="Primary grant scope allowlist"
                placeholder="/contracts/* …"
                testId="grant-primary-scope"
              />
            )}
          </Field>
        </div>
      </section>

      {/* Additional tenant grants */}
      {tenants.map((tg, index) => (
        <div
          key={index}
          data-testid={`grant-tenant-${index}`}
          style={{
            padding: 16,
            background: 'var(--bg-raised)',
            border: '1px solid var(--line-1)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ color: 'var(--violet-400)' }}>
              <Icon name="layers" size={16} />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-hi)' }}>
              Extra tenant grant
            </span>
            <button
              type="button"
              data-testid={`grant-tenant-${index}-remove`}
              onClick={() => removeTenant(index)}
              aria-label={`Remove tenant grant ${index + 1}`}
              style={{
                marginLeft: 'auto',
                width: 30,
                height: 30,
                display: 'inline-grid',
                placeItems: 'center',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line-1)',
                background: 'var(--bg-raised)',
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Tenant" name={`grant-tenant-${index}-id`}>
              {(id) => (
                <Sel
                  id={id}
                  testId={`grant-tenant-${index}-tenant`}
                  value={tg.tenant_id}
                  onChange={(v) => patchTenant(index, { tenant_id: v })}
                >
                  {tenantOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Sel>
              )}
            </Field>
            <Field label="Role" name={`grant-tenant-${index}-role`}>
              {(id) => (
                <Sel
                  id={id}
                  testId={`grant-tenant-${index}-role`}
                  value={tg.role ?? ''}
                  onChange={(v) => patchTenant(index, { role: v || null })}
                >
                  <option value="">— none —</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Sel>
              )}
            </Field>
            <Field label="Project role" name={`grant-tenant-${index}-project-role`}>
              {(id) => (
                <Sel
                  id={id}
                  testId={`grant-tenant-${index}-project-role`}
                  value={tg.project_role}
                  onChange={(v) => patchTenant(index, { project_role: v as ProjectRole })}
                >
                  {PROJECT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Sel>
              )}
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
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

      <button
        type="button"
        data-testid="grant-tenant-add"
        onClick={addTenantGrant}
        disabled={tenantOptions.length === 0}
        style={{
          ...ghostBtn,
          width: '100%',
          justifyContent: 'center',
          borderStyle: 'dashed',
          opacity: tenantOptions.length === 0 ? 0.5 : 1,
        }}
      >
        <Icon name="plus" size={14} /> Add tenant grant
      </button>
    </div>
  );
}
