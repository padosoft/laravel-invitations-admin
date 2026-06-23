import { useState } from 'react';
import { listCampaigns, listCodes, revokeCode } from '../api/endpoints';
import { useAsyncData } from '../lib/useAsyncData';
import { normalizeError } from '../api/client';
import { useToast } from '../components/Toast';
import { DataState, EmptyState } from '../components/DataState';
import { DataTable, TableSkeleton, type Column } from '../components/DataTable';
import { StatBadge } from '../components/StatBadge';
import { FilterBar } from '../components/FilterBar';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import * as ds from '../components/ds';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { GenerateCodesDrawer } from './GenerateCodesDrawer';
import { codeStateVariant, codeKindVariant } from '../components/domainBadges';
import { controlClass, baseControl } from '../components/Field';
import { formatDate } from '../lib/format';
import type { InviteCode, CodeState } from '../types';

const STATES: CodeState[] = ['active', 'redeemed', 'exhausted', 'expired', 'revoked'];

export function CodesScreen({
  initialCampaignId = null,
}: {
  initialCampaignId?: number | null;
}) {
  const toast = useToast();
  const [campaignId, setCampaignId] = useState<number | null>(initialCampaignId);
  const [state, setState] = useState<CodeState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [revoking, setRevoking] = useState<InviteCode | null>(null);
  const [revokeBusy, setRevokeBusy] = useState(false);

  const campaigns = useAsyncData(() => listCampaigns(), [], (d) => d.length === 0);
  const codes = useAsyncData(
    () => listCodes({ campaign_id: campaignId, state }),
    [campaignId, state],
    (d) => d.length === 0,
  );

  async function confirmRevoke() {
    if (!revoking) return;
    setRevokeBusy(true);
    try {
      await revokeCode(revoking.id);
      toast.success(`Code ${revoking.code} revoked.`);
      setRevoking(null);
      codes.reload();
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setRevokeBusy(false);
    }
  }

  const columns: Column<InviteCode>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{c.code}</span>
          <CopyButton value={c.code} testId={`code-row-${c.id}-copy`} />
        </div>
      ),
    },
    {
      key: 'kind',
      header: 'Kind',
      cell: (c) => (
        <StatBadge variant={codeKindVariant[c.code_kind]} testId={`code-row-${c.id}-kind`}>
          {c.code_kind}
        </StatBadge>
      ),
    },
    {
      key: 'state',
      header: 'State',
      sortValue: (c) => c.state,
      cell: (c) => (
        <StatBadge variant={codeStateVariant[c.state]} testId={`code-row-${c.id}-state`}>
          {c.state}
        </StatBadge>
      ),
    },
    {
      key: 'uses',
      header: 'Uses',
      align: 'right',
      cell: (c) => {
        const pct = c.max_uses > 0 ? Math.min(100, (c.current_uses / c.max_uses) * 100) : 0;
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono text-xs">
              {c.current_uses} / {c.max_uses}
            </span>
            <div className="h-1 w-16 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-inset)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--cyan-500)' }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'expiry',
      header: 'Expiry',
      sortValue: (c) => c.expires_at ?? '',
      cell: (c) => (
        <span className="text-xs" style={{ color: 'var(--text-low)' }}>
          {formatDate(c.expires_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <button
          type="button"
          data-testid={`code-row-${c.id}-revoke`}
          disabled={c.state === 'revoked'}
          onClick={() => setRevoking(c)}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: 'var(--line-1)', color: 'var(--danger)' }}
        >
          <Icon name="trash" size={13} /> Revoke
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="codes-screen">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 style={ds.h1}>Invite codes</h1>
          <p style={ds.subtitle}>Generate, track and revoke codes — random, vanity or signed.</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} data-testid="codes-generate">
          <Icon name="plus" size={16} /> Generate codes
        </Button>
      </div>

      <FilterBar
        testId="codes-filter-bar"
        campaigns={campaigns.data ?? []}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="codes-filter-state" className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>
            State
          </label>
          <select
            id="codes-filter-state"
            data-testid="codes-filter-state"
            className={controlClass('min-w-[10rem]')}
            style={baseControl}
            value={state ?? ''}
            onChange={(e) => setState((e.target.value || null) as CodeState | null)}
          >
            <option value="">All states</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <DataState
        state={codes.state}
        testId="codes-table"
        error={codes.error}
        onRetry={codes.reload}
        loading={<TableSkeleton columns={6} />}
        empty={
          <EmptyState heading="No codes match these filters" body="Generate codes or relax the filters above.">
            <Button onClick={() => setDrawerOpen(true)} data-testid="codes-empty-generate">
              <Icon name="plus" size={16} /> Generate codes
            </Button>
          </EmptyState>
        }
      >
        {codes.data && (
          <DataTable
            testId="codes-datatable"
            columns={columns}
            rows={codes.data}
            rowKey={(c) => c.id}
            caption="Invite codes"
          />
        )}
      </DataState>

      <GenerateCodesDrawer
        open={drawerOpen}
        campaigns={campaigns.data ?? []}
        defaultCampaignId={campaignId}
        onClose={() => setDrawerOpen(false)}
        onGenerated={() => codes.reload()}
      />

      <ConfirmModal
        open={revoking !== null}
        testId="code-revoke"
        tone="danger"
        title="Revoke code"
        confirmLabel="Revoke"
        busy={revokeBusy}
        message={
          <>
            Revoking <strong className="font-mono">{revoking?.code}</strong> permanently disables it.
            Redemptions already made are unaffected.
          </>
        }
        onConfirm={confirmRevoke}
        onCancel={() => setRevoking(null)}
      />
    </div>
  );
}
