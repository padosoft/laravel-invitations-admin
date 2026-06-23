import type { BadgeVariant } from './StatBadge';
import type {
  CampaignType,
  CampaignStatus,
  CodeState,
  CodeKind,
  Invitation,
  ReferralStatus,
  RewardState,
  WaitlistStatus,
  AbuseSeverity,
  AbuseAction,
} from '../types';

// Single source of truth for state → badge-variant mapping, so every screen
// renders the same color for the same state.

export const campaignTypeVariant: Record<CampaignType, BadgeVariant> = {
  single_use: 'neutral',
  multi_use: 'info',
  capacity: 'primary',
  referral: 'success',
  waitlist_skip: 'warning',
};

export const campaignStatusVariant: Record<CampaignStatus, BadgeVariant> = {
  draft: 'neutral',
  active: 'success',
  paused: 'warning',
  ended: 'danger',
};

export const codeStateVariant: Record<CodeState, BadgeVariant> = {
  active: 'success',
  redeemed: 'info',
  exhausted: 'warning',
  expired: 'neutral',
  revoked: 'danger',
};

export const codeKindVariant: Record<CodeKind, BadgeVariant> = {
  random: 'neutral',
  vanity: 'info',
  signed: 'primary',
};

export const invitationStatusVariant: Record<Invitation['status'], BadgeVariant> = {
  pending: 'neutral',
  sent: 'info',
  accepted: 'success',
  expired: 'warning',
  revoked: 'danger',
};

export const referralStatusVariant: Record<ReferralStatus, BadgeVariant> = {
  pending: 'neutral',
  qualified: 'info',
  rewarded: 'success',
  reversed: 'danger',
};

export const rewardStateVariant: Record<RewardState, BadgeVariant> = {
  pending: 'neutral',
  granted: 'success',
  reversed: 'danger',
  expired: 'warning',
};

export const waitlistStatusVariant: Record<WaitlistStatus, BadgeVariant> = {
  waiting: 'neutral',
  invited: 'info',
  converted: 'success',
  removed: 'danger',
};

export const abuseSeverityVariant: Record<AbuseSeverity, BadgeVariant> = {
  warn: 'warning',
  block: 'danger',
};

// Action-taken stays calm — danger reserved for an actual block (brief §6.8).
export const abuseActionVariant: Record<AbuseAction, BadgeVariant> = {
  none: 'neutral',
  flag: 'info',
  throttle: 'warning',
  block: 'danger',
};

export function humanLabel(value: string): string {
  return value.replace(/_/g, ' ');
}
