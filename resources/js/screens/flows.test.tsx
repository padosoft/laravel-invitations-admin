import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast';
import type { InviteCampaign, InviteCode, Tenant } from '../types';

// Mock the endpoints module so the flow tests drive the REAL mutation paths
// (create campaign → POST, generate codes → POST, revoke → POST) without a
// network. The mocks let us assert the action actually called the API.
const campaigns: InviteCampaign[] = [
  {
    id: 1,
    key: 'spring-launch',
    name: 'Spring launch',
    description: null,
    type: 'multi_use',
    status: 'active',
    max_redemptions_total: 1000,
    per_user_limit: 1,
    starts_at: null,
    ends_at: null,
    reward_policy: null,
    grant: null,
    created_by: 1,
    redemptions_count: 12,
  },
];
const tenants: Tenant[] = [{ id: 'acme', name: 'Acme' }];
const codes: InviteCode[] = [
  { id: 42, campaign_id: 1, code: 'SPR-7F3K', code_kind: 'random', state: 'active', max_uses: 100, current_uses: 3, issuer_id: 1, expires_at: null, grant: null },
];
const generated: InviteCode[] = [
  { id: 90, campaign_id: null, code: 'NEWCODE-01', code_kind: 'random', state: 'active', max_uses: 1, current_uses: 0, issuer_id: 1, expires_at: null, grant: null },
];

const createCampaign = vi.fn((_payload: Record<string, unknown>) => Promise.resolve(campaigns[0]));
const generateCodes = vi.fn((_payload: Record<string, unknown>) => Promise.resolve(generated));
const revokeCode = vi.fn((_id: number) => Promise.resolve({ ...codes[0], state: 'revoked' as const }));

vi.mock('../api/endpoints', () => ({
  listCampaigns: vi.fn(() => Promise.resolve(campaigns)),
  listTenants: vi.fn(() => Promise.resolve(tenants)),
  listCodes: vi.fn(() => Promise.resolve(codes)),
  createCampaign: (payload: Record<string, unknown>) => createCampaign(payload),
  updateCampaign: vi.fn(() => Promise.resolve(campaigns[0])),
  generateCodes: (payload: Record<string, unknown>) => generateCodes(payload),
  revokeCode: (id: number) => revokeCode(id),
}));

import { CampaignsScreen } from './CampaignsScreen';
import { CodesScreen } from './CodesScreen';

function withToast(ui: React.ReactNode) {
  return <ToastProvider>{ui}</ToastProvider>;
}

describe('Campaign create flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens the drawer, fills the form, and POSTs the campaign', async () => {
    render(withToast(<CampaignsScreen onViewCodes={() => {}} />));
    await waitFor(() => expect(screen.getByTestId('campaigns-table')).toHaveAttribute('data-state', 'ready'));

    fireEvent.click(screen.getByTestId('campaign-create'));
    expect(screen.getByTestId('campaign-drawer')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('campaign-field-key'), { target: { value: 'summer-2026' } });
    fireEvent.change(screen.getByTestId('campaign-field-name'), { target: { value: 'Summer 2026' } });
    fireEvent.click(screen.getByTestId('campaign-drawer-save'));

    await waitFor(() => expect(createCampaign).toHaveBeenCalledTimes(1));
    const payload = createCampaign.mock.calls[0][0];
    expect(payload.key).toBe('summer-2026');
    expect(payload.name).toBe('Summer 2026');
    // The grant object is always built (primary grant + tenants array).
    expect(payload.grant).toBeTruthy();
  });
});

describe('Generate codes flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens the generate drawer, submits, and renders the generated codes', async () => {
    render(withToast(<CodesScreen />));
    await waitFor(() => expect(screen.getByTestId('codes-table')).toHaveAttribute('data-state', 'ready'));

    fireEvent.click(screen.getByTestId('codes-generate'));
    fireEvent.change(screen.getByTestId('codes-field-count'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('codes-drawer-generate'));

    await waitFor(() => expect(generateCodes).toHaveBeenCalledTimes(1));
    const payload = generateCodes.mock.calls[0][0];
    expect(payload.count).toBe(5);
    // The generated codes are shown for copy/export.
    expect(await screen.findByTestId('codes-generated-result')).toBeInTheDocument();
    expect(screen.getByText('NEWCODE-01')).toBeInTheDocument();
  });
});

describe('Revoke code flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens the confirm modal and POSTs the revoke on confirm', async () => {
    render(withToast(<CodesScreen />));
    await waitFor(() => expect(screen.getByTestId('codes-table')).toHaveAttribute('data-state', 'ready'));

    fireEvent.click(screen.getByTestId('code-row-42-revoke'));
    expect(screen.getByTestId('code-revoke')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('code-revoke-confirm'));
    await waitFor(() => expect(revokeCode).toHaveBeenCalledWith(42));
  });
});
