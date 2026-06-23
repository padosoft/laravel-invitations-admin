import { useMemo, useState } from 'react';
import { sendInvitation } from '../api/endpoints';
import { normalizeError } from '../api/client';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { DataState, type LoadState } from '../components/DataState';
import { StatBadge } from '../components/StatBadge';
import { SegmentedTabs, type SegmentTab } from '../components/SegmentedTabs';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { MaskedEmail } from '../components/MaskedEmail';
import { SendInvitationDrawer } from './SendInvitationDrawer';
import { invitationStatusVariant } from '../components/domainBadges';
import { formatDateTime } from '../lib/format';
import type { Invitation } from '../types';

type StatusFilter = 'all' | Invitation['status'];

/**
 * Invitations — the headline is "who accepted vs. who didn't". The core package
 * currently exposes only POST /invitations (send); there is no list endpoint
 * yet, so this screen tracks invitations sent in THIS session and renders them
 * with the accepted-vs-pending breakdown. When the BE ships a list endpoint the
 * `useAsyncData` swap is a one-liner. Until then the table degrades to a clear
 * empty state rather than faking data (R14).
 */
export function InvitationsScreen() {
  const toast = useToast();
  const [sent, setSent] = useState<Invitation[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { all: sent.length, sent: 0, accepted: 0, pending: 0, expired: 0, revoked: 0 } as Record<
      StatusFilter,
      number
    >;
    for (const inv of sent) c[inv.status] = (c[inv.status] ?? 0) + 1;
    return c;
  }, [sent]);

  const filtered = useMemo(
    () => (filter === 'all' ? sent : sent.filter((i) => i.status === filter)),
    [sent, filter],
  );

  async function onSend(payload: {
    recipient: string;
    channel: string;
    role: string | null;
    context_ref: string | null;
  }): Promise<boolean> {
    try {
      const inv = await sendInvitation(payload);
      setSent((cur) => [inv, ...cur]);
      toast.success(`Invitation sent to ${payload.recipient}.`);
      return true;
    } catch (err) {
      toast.error(normalizeError(err).message);
      return false;
    }
  }

  const tabs: SegmentTab<StatusFilter>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'sent', label: 'Sent', count: counts.sent },
    { value: 'accepted', label: 'Accepted', count: counts.accepted },
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'expired', label: 'Expired', count: counts.expired },
  ];

  const accepted = counts.accepted;
  const pending = counts.pending + counts.sent;
  const expired = counts.expired + counts.revoked;
  const total = accepted + pending + expired;

  const columns: Column<Invitation>[] = [
    {
      key: 'recipient',
      header: 'Recipient',
      cell: (i) => <MaskedEmail email={i.recipient} testId={`invitation-row-${i.id}-recipient`} />,
    },
    {
      key: 'channel',
      header: 'Channel',
      cell: (i) => <span className="text-sm">{i.channel}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (i) => i.status,
      cell: (i) => (
        <StatBadge variant={invitationStatusVariant[i.status]} testId={`invitation-row-${i.id}-status`}>
          {i.status}
        </StatBadge>
      ),
    },
    {
      key: 'sent_at',
      header: 'Sent at',
      sortValue: (i) => i.sent_at ?? '',
      cell: (i) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(i.sent_at)}
        </span>
      ),
    },
    {
      key: 'accepted_at',
      header: 'Accepted at',
      cell: (i) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDateTime(i.accepted_at)}
        </span>
      ),
    },
  ];

  const tableState: LoadState = filtered.length === 0 ? 'empty' : 'ready';

  return (
    <div className="flex flex-col gap-6" data-testid="invitations-screen">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Invitations
        </h1>
        <Button onClick={() => setDrawerOpen(true)} data-testid="invitation-send">
          <Icon name="plus" size={16} /> Send invitation
        </Button>
      </div>

      {/* Accepted-vs-not breakdown bar. */}
      {total > 0 && (
        <div
          className="flex overflow-hidden rounded-lg border text-xs font-medium text-white"
          style={{ borderColor: 'var(--color-border)' }}
          data-testid="invitations-breakdown"
          role="img"
          aria-label={`${accepted} accepted, ${pending} pending, ${expired} expired`}
        >
          {accepted > 0 && (
            <div className="flex items-center justify-center py-2" style={{ width: `${(accepted / total) * 100}%`, backgroundColor: 'var(--color-success)' }}>
              {accepted} accepted
            </div>
          )}
          {pending > 0 && (
            <div className="flex items-center justify-center py-2" style={{ width: `${(pending / total) * 100}%`, backgroundColor: 'var(--color-info)' }}>
              {pending} pending
            </div>
          )}
          {expired > 0 && (
            <div className="flex items-center justify-center py-2" style={{ width: `${(expired / total) * 100}%`, backgroundColor: 'var(--color-warning)' }}>
              {expired} expired
            </div>
          )}
        </div>
      )}

      <SegmentedTabs
        tabs={tabs}
        value={filter}
        onChange={setFilter}
        testId="invitations-tabs"
        ariaLabel="Filter invitations by status"
      />

      <DataState
        state={tableState}
        testId="invitations-table"
        error={null}
        loading={null}
        empty={
          <>
            <p className="text-base font-medium">No invitations to show</p>
            <p className="text-sm">
              Send an invitation to track its acceptance here. A persistent list endpoint is on the
              core roadmap; this view reflects invitations sent during this session.
            </p>
            <Button onClick={() => setDrawerOpen(true)} data-testid="invitations-empty-send">
              <Icon name="plus" size={16} /> Send invitation
            </Button>
          </>
        }
      >
        <DataTable
          testId="invitations-datatable"
          columns={columns}
          rows={filtered}
          rowKey={(i) => i.id}
          caption="Invitations"
        />
      </DataState>

      <SendInvitationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSend={onSend} />
    </div>
  );
}
