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

export interface ListEnvelope<T> {
  data: T[];
}

export interface ItemEnvelope<T> {
  data: T;
}
