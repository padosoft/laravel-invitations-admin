import { useState } from 'react';
import { listCampaigns, listTenants } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { DataState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { CampaignDrawer } from './CampaignDrawer';
import { campaignTypeVariant, campaignStatusVariant, humanLabel } from '../components/domainBadges';
import { formatDate } from '../lib/format';
import type { InviteCampaign } from '../types';

// Roles offered in the grant editor. super-admin is intentionally excluded
// (the BE rejects it). A host with Spatie roles can widen this later.
const ROLE_OPTIONS = ['admin', 'editor', 'viewer', 'dpo'];

export function CampaignsScreen({ onViewCodes }: { onViewCodes: (campaignId: number) => void }) {
  const campaigns = useAsyncData(() => listCampaigns(), [], (d) => d.length === 0);
  const tenants = useAsyncData(() => listTenants(), [], (d) => d.length === 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InviteCampaign | null>(null);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(c: InviteCampaign) {
    setEditing(c);
    setDrawerOpen(true);
  }

  const columns: Column<InviteCampaign>[] = [
    {
      key: 'key',
      header: 'Key',
      sortValue: (c) => c.key,
      cell: (c) => <span className="font-mono text-xs">{c.key}</span>,
    },
    { key: 'name', header: 'Name', sortValue: (c) => c.name, cell: (c) => c.name },
    {
      key: 'type',
      header: 'Type',
      cell: (c) => (
        <StatBadge variant={campaignTypeVariant[c.type]} testId={`campaign-row-${c.id}-type`}>
          {humanLabel(c.type)}
        </StatBadge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => c.status,
      cell: (c) => (
        <StatBadge variant={campaignStatusVariant[c.status]} testId={`campaign-row-${c.id}-status`}>
          {c.status}
        </StatBadge>
      ),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      align: 'right',
      cell: (c) => (
        <span className="font-mono text-xs">
          {c.redemptions_count ?? 0}
          {c.max_redemptions_total != null ? ` / ${c.max_redemptions_total}` : ' / ∞'}
        </span>
      ),
    },
    {
      key: 'window',
      header: 'Window',
      cell: (c) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(c.starts_at)} → {formatDate(c.ends_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            data-testid={`campaign-row-${c.id}-edit`}
            onClick={() => openEdit(c)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <Icon name="edit" size={13} /> Edit
          </button>
          <button
            type="button"
            data-testid={`campaign-row-${c.id}-codes`}
            onClick={() => onViewCodes(c.id)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <Icon name="code" size={13} /> Codes
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="campaigns-screen">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Campaigns
        </h1>
        <Button onClick={openCreate} data-testid="campaign-create">
          <Icon name="plus" size={16} /> New campaign
        </Button>
      </div>

      <DataState
        state={campaigns.state}
        testId="campaigns-table"
        error={campaigns.error}
        onRetry={campaigns.reload}
        loading={<TableSkeleton columns={7} />}
        empty={
          <>
            <p className="text-base font-medium">No campaigns yet</p>
            <p className="text-sm">Create your first campaign to start issuing invite codes.</p>
            <Button onClick={openCreate} data-testid="campaigns-empty-create">
              <Icon name="plus" size={16} /> Create your first
            </Button>
          </>
        }
      >
        {campaigns.data && (
          <DataTable
            testId="campaigns-datatable"
            columns={columns}
            rows={campaigns.data}
            rowKey={(c) => c.id}
            caption="Invite campaigns"
          />
        )}
      </DataState>

      <CampaignDrawer
        open={drawerOpen}
        campaign={editing}
        roleOptions={ROLE_OPTIONS}
        tenantOptions={tenants.data ?? []}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => campaigns.reload()}
      />
    </div>
  );
}
