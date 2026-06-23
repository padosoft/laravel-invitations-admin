import { createElement } from 'react';

// Lucide-geometry icon set ported verbatim from the Claude Design DC so the
// HUD visuals match exactly. Each entry is a list of [svgTag, attrs]. Icons are
// decorative by default (aria-hidden); an icon used as a button's sole content
// gets its label from the button's aria-label.

type Prim = [string, Record<string, number | string>];

const ICONS: Record<string, Prim[]> = {
  grid: [['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }], ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }], ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }], ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }]],
  megaphone: [['path', { d: 'M3 11l13-6v14L3 13z' }], ['path', { d: 'M3 11v3a2 2 0 0 0 2 2h1' }], ['path', { d: 'M16 8a3.5 3.5 0 0 1 0 7' }], ['path', { d: 'M7 16v3a1.5 1.5 0 0 0 3 0v-3' }]],
  ticket: [['path', { d: 'M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z' }], ['path', { d: 'M13 7v2M13 13v2' }]],
  mail: [['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ['path', { d: 'M3 7.5l9 6 9-6' }]],
  share: [['circle', { cx: 6, cy: 12, r: 2.5 }], ['circle', { cx: 18, cy: 6, r: 2.5 }], ['circle', { cx: 18, cy: 18, r: 2.5 }], ['path', { d: 'M8.3 10.9l7.4-3.7M8.3 13.1l7.4 3.7' }]],
  gift: [['rect', { x: 3, y: 8, width: 18, height: 4, rx: 1 }], ['path', { d: 'M5 12v8h14v-8' }], ['path', { d: 'M12 8v12' }], ['path', { d: 'M12 8C12 6 10.5 4.5 9 5S9 8 12 8zM12 8c0-2 1.5-3.5 3-3s0 3-3 3z' }]],
  list: [['path', { d: 'M9 6h11M9 12h11M9 18h11' }], ['path', { d: 'M4.5 5.5v3.2M3.6 6h.9' }], ['circle', { cx: 4.2, cy: 12, r: 0.6 }], ['circle', { cx: 4.2, cy: 18, r: 0.6 }]],
  shield: [['path', { d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z' }], ['path', { d: 'M9.3 12l1.9 1.9L15 10' }]],
  settings: [['circle', { cx: 12, cy: 12, r: 3 }], ['path', { d: 'M12 2v3M12 19v3M2 12h3M19 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1' }]],
  layers: [['path', { d: 'M12 3l9 5-9 5-9-5z' }], ['path', { d: 'M3 13l9 5 9-5' }]],
  search: [['circle', { cx: 11, cy: 11, r: 7 }], ['path', { d: 'M21 21l-4.2-4.2' }]],
  bell: [['path', { d: 'M18 9a6 6 0 0 0-12 0c0 6-2 7-2 7h16s-2-1-2-7' }], ['path', { d: 'M10.5 20a2 2 0 0 0 3 0' }]],
  help: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M9.6 9.4a2.4 2.4 0 0 1 4.4 1.3c0 1.6-1.9 1.9-1.9 3.4' }], ['path', { d: 'M12 17.4h.01' }]],
  sun: [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8' }]],
  moon: [['path', { d: 'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z' }]],
  plus: [['path', { d: 'M12 5v14M5 12h14' }]],
  x: [['path', { d: 'M6 6l12 12M18 6L6 18' }]],
  copy: [['rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }], ['path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }]],
  check: [['path', { d: 'M5 12.5l4.5 4.5L19 7' }]],
  chevDown: [['path', { d: 'M6 9l6 6 6-6' }]],
  chevRight: [['path', { d: 'M9 6l6 6-6 6' }]],
  chevLeft: [['path', { d: 'M15 6l-6 6 6 6' }]],
  up: [['path', { d: 'M12 19V5M6 11l6-6 6 6' }]],
  down: [['path', { d: 'M12 5v14M6 13l6 6 6-6' }]],
  arrowRight: [['path', { d: 'M5 12h14M13 6l6 6-6 6' }]],
  trendUp: [['path', { d: 'M3 17l6-6 4 4 7-7' }], ['path', { d: 'M18 7h3v3' }]],
  trendDown: [['path', { d: 'M3 7l6 6 4-4 7 7' }], ['path', { d: 'M18 17h3v-3' }]],
  calendar: [['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }], ['path', { d: 'M3 9.5h18M8 3v4M16 3v4' }]],
  trash: [['path', { d: 'M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.8 12a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1l.8-12' }]],
  rotate: [['path', { d: 'M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3 8.5' }], ['path', { d: 'M3 4v4.5h4.5' }]],
  send: [['path', { d: 'M21 3L10.5 13.5M21 3l-6.5 18-4-8.5L2 8.5z' }]],
  filter: [['path', { d: 'M3 5h18l-7 8v6l-4-2v-4z' }]],
  external: [['path', { d: 'M14 4h6v6M20 4l-8.5 8.5M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5' }]],
  ban: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M5.6 5.6l12.8 12.8' }]],
  alert: [['path', { d: 'M10.3 4l-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z' }], ['path', { d: 'M12 9.5v4M12 17h.01' }]],
  user: [['circle', { cx: 12, cy: 8, r: 3.5 }], ['path', { d: 'M5 20c0-3.6 3-5.5 7-5.5s7 1.9 7 5.5' }]],
  sparkles: [['path', { d: 'M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4z' }], ['path', { d: 'M18.5 15l.7 1.9 1.8.6-1.8.6-.7 1.9-.7-1.9-1.8-.6 1.8-.6z' }]],
  zap: [['path', { d: 'M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z' }]],
  dollar: [['path', { d: 'M12 2v20' }], ['path', { d: 'M16.5 6.5C15.8 5 14 4 12 4 8.8 4 7.5 5.8 7.5 7.5S9 10.5 12 11s4.5 1.6 4.5 3.5S15.2 18 12 18c-2.3 0-4-1-4.6-2.5' }]],
  clock: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 7v5l3.3 2' }]],
  hash: [['path', { d: 'M5 9h14M5 15h14M9.5 4l-1.5 16M16 4l-1.5 16' }]],
  redeem: [['path', { d: 'M20 7H4v5h16zM12 7v13M12 7C12 4.5 10 3 8.5 4S9 7 12 7zM12 7c0-2.5 2-4 3.5-3S15 7 12 7zM5 12v8h14v-8' }]],
  panel: [['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }], ['path', { d: 'M9 4v16' }]],
  target: [['circle', { cx: 12, cy: 12, r: 8 }], ['circle', { cx: 12, cy: 12, r: 4 }], ['circle', { cx: 12, cy: 12, r: 0.6 }]],
  activity: [['path', { d: 'M3 12h4l3 8 4-16 3 8h4' }]],
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const prims = ICONS[name] ?? [];
  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
      className,
      style: { display: 'block', flexShrink: 0 },
    },
    prims.map((el, i) => createElement(el[0], { key: i, ...el[1] })),
  );
}
