import { api } from './client';
import type {
  InviteCampaign,
  InviteCode,
  InviteMetrics,
  Invitation,
  Tenant,
  CodeState,
  Referral,
  ReferralStatus,
  Reward,
  RewardState,
  RewardParty,
  WaitlistEntry,
  WaitlistStatus,
  AbuseSignal,
  AbuseSeverity,
  AbuseAction,
  ListEnvelope,
  ItemEnvelope,
} from '../types';

// Thin endpoint wrappers, one per core route. Each returns the unwrapped
// payload so screens never re-derive the `{ data }` envelope shape.

export async function listCampaigns(): Promise<InviteCampaign[]> {
  const { data } = await api.get<ListEnvelope<InviteCampaign>>('/campaigns');
  return data.data;
}

export async function createCampaign(payload: Record<string, unknown>): Promise<InviteCampaign> {
  const { data } = await api.post<ItemEnvelope<InviteCampaign>>('/campaigns', payload);
  return data.data;
}

export async function updateCampaign(
  id: number,
  payload: Record<string, unknown>,
): Promise<InviteCampaign> {
  const { data } = await api.patch<ItemEnvelope<InviteCampaign>>(`/campaigns/${id}`, payload);
  return data.data;
}

export async function listTenants(): Promise<Tenant[]> {
  const { data } = await api.get<ListEnvelope<Tenant>>('/tenants');
  return data.data;
}

export async function listCodes(params: {
  campaign_id?: number | null;
  state?: CodeState | null;
}): Promise<InviteCode[]> {
  const query: Record<string, string | number> = {};
  if (params.campaign_id != null) query.campaign_id = params.campaign_id;
  if (params.state) query.state = params.state;
  const { data } = await api.get<ListEnvelope<InviteCode>>('/codes', { params: query });
  return data.data;
}

export async function generateCodes(payload: {
  count: number;
  max_uses?: number | null;
  length?: number | null;
  expires_at?: string | null;
  campaign_id?: number | null;
}): Promise<InviteCode[]> {
  const { data } = await api.post<ListEnvelope<InviteCode>>('/codes', payload);
  return data.data;
}

export async function revokeCode(id: number): Promise<InviteCode> {
  const { data } = await api.post<ItemEnvelope<InviteCode>>(`/codes/${id}/revoke`);
  return data.data;
}

export async function getMetrics(params: {
  campaign_id?: number | null;
  since_days?: number | null;
}): Promise<InviteMetrics> {
  const query: Record<string, string | number> = {};
  if (params.campaign_id != null) query.campaign_id = params.campaign_id;
  if (params.since_days != null) query.since_days = params.since_days;
  const { data } = await api.get<ItemEnvelope<InviteMetrics>>('/metrics', { params: query });
  return data.data;
}

export async function sendInvitation(payload: {
  recipient: string;
  channel?: string;
  role?: string | null;
  context_ref?: string | null;
  code_id?: number | null;
}): Promise<Invitation> {
  const { data } = await api.post<ItemEnvelope<Invitation>>('/invitations', payload);
  return data.data;
}

export async function listReferrals(params: {
  campaign_id?: number | null;
  status?: ReferralStatus | null;
}): Promise<Referral[]> {
  const query: Record<string, string | number> = {};
  if (params.campaign_id != null) query.campaign_id = params.campaign_id;
  if (params.status) query.status = params.status;
  const { data } = await api.get<ListEnvelope<Referral>>('/referrals', { params: query });
  return data.data;
}

export async function listRewards(params: {
  state?: RewardState | null;
  party?: RewardParty | null;
}): Promise<Reward[]> {
  const query: Record<string, string | number> = {};
  if (params.state) query.state = params.state;
  if (params.party) query.party = params.party;
  const { data } = await api.get<ListEnvelope<Reward>>('/rewards', { params: query });
  return data.data;
}

export async function listWaitlist(params: {
  status?: WaitlistStatus | null;
}): Promise<WaitlistEntry[]> {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  const { data } = await api.get<ListEnvelope<WaitlistEntry>>('/waitlist', { params: query });
  return data.data;
}

export async function listAbuseSignals(params: {
  severity?: AbuseSeverity | null;
  action?: AbuseAction | null;
}): Promise<AbuseSignal[]> {
  const query: Record<string, string | number> = {};
  if (params.severity) query.severity = params.severity;
  if (params.action) query.action = params.action;
  const { data } = await api.get<ListEnvelope<AbuseSignal>>('/abuse-signals', { params: query });
  return data.data;
}
