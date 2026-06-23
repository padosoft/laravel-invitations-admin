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
  /** Breadcrumb group + page title (mirrors the DC navConfig). */
  crumb: string;
  title: string;
  /** Screens delivered in this v1.0; the rest render an informative placeholder. */
  implemented: boolean;
}

// Left-nav order = funnel order (design brief §6); icons + crumb/title match the
// Padosoft DC navConfig.
export const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'grid', crumb: 'Growth', title: 'Virality overview', implemented: true },
  { id: 'campaigns', label: 'Campaigns', icon: 'megaphone', crumb: 'Growth', title: 'Campaigns', implemented: true },
  { id: 'codes', label: 'Codes', icon: 'ticket', crumb: 'Growth', title: 'Invite codes', implemented: true },
  { id: 'invitations', label: 'Invitations', icon: 'mail', crumb: 'Growth', title: 'Invitations', implemented: true },
  { id: 'referrals', label: 'Referrals', icon: 'share', crumb: 'Growth', title: 'Referral graph', implemented: true },
  { id: 'rewards', label: 'Rewards', icon: 'gift', crumb: 'Growth', title: 'Reward ledger', implemented: true },
  { id: 'waitlist', label: 'Waitlist', icon: 'list', crumb: 'Growth', title: 'Waitlist', implemented: true },
  { id: 'abuse', label: 'Anti-abuse', icon: 'shield', crumb: 'Trust', title: 'Anti-abuse review', implemented: true },
  { id: 'settings', label: 'Settings', icon: 'settings', crumb: 'Config', title: 'Settings', implemented: false },
];
