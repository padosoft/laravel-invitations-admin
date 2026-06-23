import { useState } from 'react';
import { Shell } from './Shell';
import { ToastProvider } from './components/Toast';
import { NAV, type SectionId } from './nav';
import { OverviewScreen } from './screens/OverviewScreen';
import { CampaignsScreen } from './screens/CampaignsScreen';
import { CodesScreen } from './screens/CodesScreen';
import { InvitationsScreen } from './screens/InvitationsScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

/**
 * Top-level app. Navigation is local state (hash-free) so the package mounts
 * cleanly under any host route prefix without owning the URL. Overview's
 * campaign filter + the global date range live here so they survive section
 * switches.
 */
export function App() {
  const [active, setActive] = useState<SectionId>('overview');
  const [sinceDays, setSinceDays] = useState(30);
  const [overviewCampaign, setOverviewCampaign] = useState<number | null>(null);
  const [codesCampaign, setCodesCampaign] = useState<number | null>(null);

  function viewCodesFor(campaignId: number) {
    setCodesCampaign(campaignId);
    setActive('codes');
  }

  return (
    <ToastProvider>
      <Shell active={active} onNavigate={setActive} sinceDays={sinceDays} onSinceDaysChange={setSinceDays}>
        {active === 'overview' && (
          <OverviewScreen
            sinceDays={sinceDays}
            campaignId={overviewCampaign}
            onCampaignChange={setOverviewCampaign}
          />
        )}
        {active === 'campaigns' && <CampaignsScreen onViewCodes={viewCodesFor} />}
        {active === 'codes' && <CodesScreen key={codesCampaign ?? 'all'} initialCampaignId={codesCampaign} />}
        {active === 'invitations' && <InvitationsScreen />}
        {NAV.filter((n) => !n.implemented).map(
          (item) => active === item.id && <PlaceholderScreen key={item.id} item={item} />,
        )}
      </Shell>
    </ToastProvider>
  );
}
