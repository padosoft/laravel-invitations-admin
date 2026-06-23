import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { InviteCampaign, InviteMetrics } from './types';

// Mock the endpoints module so the smoke test exercises the real components and
// state machine without a network. This is the SPA's only external boundary.
const metrics: InviteMetrics = {
  codes_issued: 120,
  redemptions: 42,
  invites_sent: 80,
  invites_accepted: 50,
  referrals_qualified: 12,
  distinct_referrers: 9,
  k_factor: 1.35,
  acceptance_rate: 0.625,
  conversion_rate: 0.35,
  ttr_p50_seconds: 3600,
  ttr_p90_seconds: 86400,
};

const campaigns: InviteCampaign[] = [
  {
    id: 1,
    key: 'launch-2026',
    name: 'Launch 2026',
    description: null,
    type: 'referral',
    status: 'active',
    max_redemptions_total: 1000,
    per_user_limit: 1,
    starts_at: null,
    ends_at: null,
    reward_policy: null,
    grant: null,
    created_by: 1,
    redemptions_count: 42,
  },
];

vi.mock('./api/endpoints', () => ({
  getMetrics: vi.fn(() => Promise.resolve(metrics)),
  listCampaigns: vi.fn(() => Promise.resolve(campaigns)),
  listTenants: vi.fn(() => Promise.resolve([{ id: 'default', name: 'Default' }])),
  listCodes: vi.fn(() => Promise.resolve([])),
  generateCodes: vi.fn(() => Promise.resolve([])),
  revokeCode: vi.fn(() => Promise.resolve()),
  sendInvitation: vi.fn(() => Promise.resolve()),
}));

import { App } from './App';

describe('App (smoke)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Overview screen and resolves metrics into the ready state', async () => {
    render(<App />);
    expect(screen.getByTestId('overview-screen')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('overview-metrics')).toHaveAttribute('data-state', 'ready');
    });
    expect(screen.getByTestId('overview-kpi-kfactor-value')).toHaveTextContent('1.35');
  });

  it('navigates to Campaigns and lists the seeded campaign', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('app-nav-campaigns'));

    expect(screen.getByTestId('campaigns-screen')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('campaigns-table')).toHaveAttribute('data-state', 'ready');
    });
    expect(screen.getByText('Launch 2026')).toBeInTheDocument();
  });

  it('opens the campaign create drawer with a fully-expanded grant editor', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('app-nav-campaigns'));
    await waitFor(() => expect(screen.getByTestId('campaigns-table')).toHaveAttribute('data-state', 'ready'));

    fireEvent.click(screen.getByTestId('campaign-create'));
    expect(screen.getByTestId('campaign-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('grant-editor')).toBeInTheDocument();
    // super-admin must not be a selectable grant role.
    const role = screen.getByTestId('grant-primary-role') as HTMLSelectElement;
    expect(Array.from(role.options).map((o) => o.value)).not.toContain('super-admin');
  });

  it('shows the empty state on the Invitations screen before anything is sent', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('app-nav-invitations'));
    expect(screen.getByTestId('invitations-table')).toHaveAttribute('data-state', 'empty');
    expect(screen.getByTestId('invitations-table-empty')).toBeInTheDocument();
  });
});
