import type { IconName } from './components/Icon';

export type SectionId =
  | 'overview'
  | 'campaigns'
  | 'codes'
  | 'invitations'
  | 'referrals'
  | 'rewards'
  | 'waitlist'
  | 'abuse'
  | 'settings';

export interface NavItem {
  id: SectionId;
  label: string;
  icon: IconName;
  /** Screens delivered in this v1.0; the rest render an informative placeholder. */
  implemented: boolean;
}

// Left-nav order = funnel order (design brief §6).
export const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'overview', implemented: true },
  { id: 'campaigns', label: 'Campaigns', icon: 'campaign', implemented: true },
  { id: 'codes', label: 'Codes', icon: 'code', implemented: true },
  { id: 'invitations', label: 'Invitations', icon: 'invitation', implemented: true },
  { id: 'referrals', label: 'Referrals', icon: 'referral', implemented: true },
  { id: 'rewards', label: 'Rewards', icon: 'reward', implemented: true },
  { id: 'waitlist', label: 'Waitlist', icon: 'waitlist', implemented: true },
  { id: 'abuse', label: 'Anti-abuse', icon: 'abuse', implemented: true },
  { id: 'settings', label: 'Settings', icon: 'settings', implemented: false },
];
