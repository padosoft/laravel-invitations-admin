import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GrantEditor, emptyGrant } from './GrantEditor';
import type { InviteGrant, Tenant } from '../types';

const TENANTS: Tenant[] = [
  { id: 'acme', name: 'Acme' },
  { id: 'globex', name: 'Globex' },
];
const ROLES = ['admin', 'editor', 'viewer'];

function setup(initial: InviteGrant = emptyGrant()) {
  const onChange = vi.fn();
  let current = initial;
  const rerenderWith = (g: InviteGrant) => {
    current = g;
    rerender(<GrantEditor value={current} onChange={handle} roleOptions={ROLES} tenantOptions={TENANTS} />);
  };
  const handle = (g: InviteGrant) => {
    onChange(g);
    rerenderWith(g);
  };
  const { rerender } = render(
    <GrantEditor value={current} onChange={handle} roleOptions={ROLES} tenantOptions={TENANTS} />,
  );
  return { onChange };
}

describe('GrantEditor', () => {
  it('never offers super-admin as a primary role option', () => {
    setup();
    const select = screen.getByTestId('grant-primary-role') as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).not.toContain('super-admin');
  });

  it('adds an additional tenant grant and lifts it to onChange', () => {
    const { onChange } = setup();
    expect(screen.queryByTestId('grant-tenant-0')).toBeNull();

    fireEvent.click(screen.getByTestId('grant-tenant-add'));

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0] as InviteGrant;
    expect(last.tenants).toHaveLength(1);
    // The row is now rendered (component is controlled, re-rendered with new value).
    expect(screen.getByTestId('grant-tenant-0')).toBeInTheDocument();
  });

  it('removes a tenant grant', () => {
    const { onChange } = setup({
      ...emptyGrant(),
      tenants: [{ tenant_id: 'acme', role: null, projects: [], project_role: 'member', scope_allowlist: null }],
    });
    expect(screen.getByTestId('grant-tenant-0')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('grant-tenant-0-remove'));

    const last = onChange.mock.calls.at(-1)![0] as InviteGrant;
    expect(last.tenants).toHaveLength(0);
    expect(screen.queryByTestId('grant-tenant-0')).toBeNull();
  });

  it('updates the primary project_role via the select', () => {
    const { onChange } = setup();
    fireEvent.change(screen.getByTestId('grant-primary-project-role'), { target: { value: 'owner' } });
    const last = onChange.mock.calls.at(-1)![0] as InviteGrant;
    expect(last.project_role).toBe('owner');
  });
});
