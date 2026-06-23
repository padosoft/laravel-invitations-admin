import type { BadgeVariant } from './StatBadge';
import type { CampaignType, CampaignStatus, CodeState, CodeKind, Invitation } from '../types';

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

export function humanLabel(value: string): string {
  return value.replace(/_/g, ' ');
}
