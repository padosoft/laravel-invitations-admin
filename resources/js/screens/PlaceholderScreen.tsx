import { Icon } from '../components/Icon';
import type { NavItem } from '../nav';

/**
 * Informative placeholder for the sections planned but not in the v1.0 SPA
 * subset (Referrals, Rewards, Waitlist, Anti-abuse, Settings). The design brief
 * specifies these screens; the core HTTP API does not yet expose their read
 * endpoints, so we render a clear "coming soon" rather than a broken table.
 */
export function PlaceholderScreen({ item }: { item: NavItem }) {
  return (
    <div className="flex flex-col gap-6" data-testid={`${item.id}-screen`}>
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        {item.label}
      </h1>
      <div
        data-testid={`${item.id}-placeholder`}
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <span style={{ color: 'var(--color-primary)' }}>
          <Icon name={item.icon} size={32} />
        </span>
        <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
          {item.label} is coming soon
        </p>
        <p className="max-w-md text-sm">
          This screen is fully specified in the admin design brief and lands once the core package
          exposes its read endpoints. The component kit and theme it will use already ship in this
          package.
        </p>
      </div>
    </div>
  );
}
