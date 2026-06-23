// Minimal inline SVG icon set (no icon-library dependency). Each icon is
// decorative by default (aria-hidden); callers that use an icon as the sole
// content of a button must supply an aria-label on the button itself.

type IconName =
  | 'overview'
  | 'campaign'
  | 'code'
  | 'invitation'
  | 'referral'
  | 'reward'
  | 'waitlist'
  | 'abuse'
  | 'settings'
  | 'copy'
  | 'check'
  | 'close'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'sun'
  | 'moon'
  | 'help'
  | 'chevron'
  | 'menu'
  | 'warning';

const PATHS: Record<IconName, string> = {
  overview: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  campaign: 'M3 11l18-5v12L3 14v-3zm0 0v3a4 4 0 004 4',
  code: 'M8 17l-5-5 5-5m8 10l5-5-5-5',
  invitation: 'M4 4h16v16H4zM4 7l8 5 8-5',
  referral: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0',
  reward: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8z',
  waitlist: 'M6 2h12v6l-4 4 4 4v6H6v-6l4-4-4-4z',
  abuse: 'M12 2l9 4v6c0 5-3.8 9-9 10-5.2-1-9-5-9-10V6z',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h2m14 0h2M12 3v2m0 14v2',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  check: 'M5 13l4 4L19 7',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4',
  trash: 'M4 7h16M9 7V4h6v3m-7 0v13h8V7',
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m12.7-6.7l1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m12.7 12.7l1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  help: 'M12 18h.01M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4M12 22a10 10 0 100-20 10 10 0 000 20z',
  chevron: 'M9 6l6 6-6 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  warning: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z',
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export type { IconName };
