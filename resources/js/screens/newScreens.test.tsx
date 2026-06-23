import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Referral, Reward, WaitlistEntry, AbuseSignal } from '../types';

// Mock the endpoints module — the screens' only external boundary.
const referrals: Referral[] = [
  { id: 1, referrer_id: 7, referee_id: 9, code_id: 3, campaign_id: 1, status: 'qualified', attributed_at: '2026-06-20T10:00:00Z', qualified_at: '2026-06-21T10:00:00Z' },
];
const rewards: Reward[] = [
  { id: 1, referral_id: 1, beneficiary_id: 7, party: 'referrer', type: 'credit', amount: 10, unit: 'EUR', trigger: 'qualified_referral', state: 'granted', granted_at: '2026-06-21T10:00:00Z', reversed_at: null },
];
const waitlist: WaitlistEntry[] = [
  { id: 1, email: 'alice@acme.com', position: 2, priority: 50, referral_count: 3, status: 'waiting', granted_code_id: null, invited_at: null, converted_at: null },
  { id: 2, email: 'bob@acme.com', position: 1, priority: 90, referral_count: 8, status: 'invited', granted_code_id: 5, invited_at: '2026-06-22T10:00:00Z', converted_at: null },
];
const signals: AbuseSignal[] = [
  { id: 1, subject_type: 'ip', subject_value: 'a1b2c3d4e5f6a7b8c9', signal_type: 'velocity', severity: 'block', score: 92, action_taken: 'block', created_at: '2026-06-22T10:00:00Z' },
];

vi.mock('../api/endpoints', () => ({
  listCampaigns: vi.fn(() => Promise.resolve([])),
  listReferrals: vi.fn(() => Promise.resolve(referrals)),
  listRewards: vi.fn(() => Promise.resolve(rewards)),
  listWaitlist: vi.fn(() => Promise.resolve(waitlist)),
  listAbuseSignals: vi.fn(() => Promise.resolve(signals)),
}));

import { ReferralsScreen } from './ReferralsScreen';
import { RewardsScreen } from './RewardsScreen';
import { WaitlistScreen } from './WaitlistScreen';
import { AntiAbuseScreen } from './AntiAbuseScreen';

describe('ReferralsScreen', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves to ready and renders the referrer→referee row with a status badge', async () => {
    render(<ReferralsScreen />);
    await waitFor(() => expect(screen.getByTestId('referrals-table')).toHaveAttribute('data-state', 'ready'));
    expect(screen.getByTestId('referral-row-1-status')).toHaveTextContent('qualified');
  });
});

describe('RewardsScreen', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a ledger row with party + state badges and the formatted amount', async () => {
    render(<RewardsScreen />);
    await waitFor(() => expect(screen.getByTestId('rewards-table')).toHaveAttribute('data-state', 'ready'));
    expect(screen.getByTestId('reward-row-1-party')).toHaveTextContent('referrer');
    expect(screen.getByTestId('reward-row-1-state')).toHaveTextContent('granted');
    expect(screen.getByText('10 EUR')).toBeInTheDocument();
  });
});

describe('WaitlistScreen', () => {
  beforeEach(() => vi.clearAllMocks());

  it('orders the queue priority desc / position asc and masks the email', async () => {
    render(<WaitlistScreen />);
    await waitFor(() => expect(screen.getByTestId('waitlist-table')).toHaveAttribute('data-state', 'ready'));

    // bob (priority 90) must render before alice (priority 50) despite alice's
    // higher position — proving the documented queue ordering, not payload order.
    const emails = screen.getAllByTestId(/waitlist-row-\d+-email/);
    expect(emails[0]).toHaveTextContent('b•••@acme.com');
    expect(emails[1]).toHaveTextContent('a•••@acme.com');
  });
});

describe('AntiAbuseScreen', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the signal feed with a truncated hash and severity/action badges', async () => {
    render(<AntiAbuseScreen />);
    await waitFor(() => expect(screen.getByTestId('abuse-table')).toHaveAttribute('data-state', 'ready'));
    expect(screen.getByTestId('abuse-row-1-severity')).toHaveTextContent('block');
    expect(screen.getByTestId('abuse-row-1-action')).toHaveTextContent('block');
    // The hashed subject is truncated, never rendered in full.
    expect(screen.getByText('a1b2c3d4e5f6…')).toBeInTheDocument();
  });
});
