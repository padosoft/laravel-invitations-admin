// Authoritative data shapes — copied verbatim from the core repo's
// docs/ADMIN-DESIGN-BRIEF.md §10 (R9: keep field names exact, mirror the BE).

export type CampaignType = 'single_use' | 'multi_use' | 'capacity' | 'referral' | 'waitlist_skip';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type CodeState = 'active' | 'redeemed' | 'exhausted' | 'expired' | 'revoked';
export type CodeKind = 'random' | 'vanity' | 'signed';
export type ProjectRole = 'member' | 'admin' | 'owner';
export type Channel = 'email' | 'sms' | 'in_app' | 'link';

export interface TenantGrant {
  tenant_id: string;
  role: string | null;
  projects: string[];
  project_role: ProjectRole;
  scope_allowlist?: Record<string, unknown> | null;
}

export interface InviteGrant {
  role: string | null;
  projects: string[];
  project_role: ProjectRole;
  scope_allowlist?: Record<string, unknown> | null;
  tenants?: TenantGrant[];
}

export interface InviteCampaign {
  id: number;
  key: string;
  name: string;
  description: string | null;
  type: CampaignType;
  status: CampaignStatus;
  max_redemptions_total: number | null;
  per_user_limit: number;
  starts_at: string | null;
  ends_at: string | null;
  reward_policy: Record<string, unknown> | null;
  grant: InviteGrant | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  // Optional rollup the BE may include on the resource; tolerated if absent.
  redemptions_count?: number;
}

export interface InviteCode {
  id: number;
  campaign_id: number | null;
  code: string;
  code_kind: CodeKind;
  state: CodeState;
  max_uses: number;
  current_uses: number;
  issuer_id: number | null;
  expires_at: string | null;
  grant: InviteGrant | null;
  created_at?: string;
}

export interface InviteMetrics {
  codes_issued: number;
  redemptions: number;
  invites_sent: number;
  invites_accepted: number;
  referrals_qualified: number;
  distinct_referrers: number;
  k_factor: number;
  acceptance_rate: number;
  conversion_rate: number;
  ttr_p50_seconds: number | null;
  ttr_p90_seconds: number | null;
}

export interface Invitation {
  id: number;
  recipient: string;
  channel: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'revoked';
  sent_at: string | null;
  accepted_at: string | null;
  role: string | null;
}

export interface Tenant {
  id: string;
  name: string;
}

// ── New-suite read surfaces (live core endpoints, field-accurate per the core
//    repo's InviteReadController, commit 8b6f495). Keep field names exact (R9).

export type ReferralStatus = 'pending' | 'qualified' | 'rewarded' | 'reversed';
export interface Referral {
  id: number;
  referrer_id: number;
  referee_id: number;
  code_id: number | null;
  campaign_id: number | null;
  status: ReferralStatus;
  attributed_at: string | null;
  qualified_at: string | null;
}

export type RewardState = 'pending' | 'granted' | 'reversed' | 'expired';
export type RewardParty = 'referrer' | 'referee';
export interface Reward {
  id: number;
  referral_id: number | null;
  beneficiary_id: number;
  party: RewardParty;
  type: string;
  amount: number | string;
  unit: string | null;
  trigger: string | null;
  state: RewardState;
  granted_at: string | null;
  reversed_at: string | null;
}

export type WaitlistStatus = 'waiting' | 'invited' | 'converted' | 'removed';
export interface WaitlistEntry {
  id: number;
  email: string;
  position: number;
  priority: number;
  referral_count: number;
  status: WaitlistStatus;
  granted_code_id: number | null;
  invited_at: string | null;
  converted_at: string | null;
}

export type AbuseSeverity = 'warn' | 'block';
export type AbuseAction = 'none' | 'flag' | 'throttle' | 'block';
export interface AbuseSignal {
  id: number;
  subject_type: 'ip' | 'email' | 'account' | 'fingerprint' | string;
  subject_value: string; // already hashed by the core
  signal_type: string;
  severity: AbuseSeverity;
  score: number;
  action_taken: AbuseAction;
  created_at: string;
}

export interface ListEnvelope<T> {
  data: T[];
}

export interface ItemEnvelope<T> {
  data: T;
}
