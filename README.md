<div align="center">

# Laravel Invitations — Admin

**A polished, themeable React admin console for [`padosoft/laravel-invitations`](https://github.com/padosoft/laravel-invitations).**

Campaigns · invite codes · invitations (who accepted vs. who didn't) · referral graph · reward ledger · waitlist · anti-abuse review · virality analytics — over the headless core's HTTP API.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/padosoft/laravel-invitations-admin.svg?style=flat-square)](https://packagist.org/packages/padosoft/laravel-invitations-admin)
[![Tests](https://img.shields.io/github/actions/workflow/status/padosoft/laravel-invitations-admin/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/padosoft/laravel-invitations-admin/actions)
[![PHP](https://img.shields.io/badge/php-%5E8.3-777bb4?style=flat-square)](https://www.php.net)
[![Laravel](https://img.shields.io/badge/laravel-12%20%7C%2013-ff2d20?style=flat-square)](https://laravel.com)
[![React](https://img.shields.io/badge/react-19-149eca?style=flat-square)](https://react.dev)
[![License](https://img.shields.io/packagist/l/padosoft/laravel-invitations-admin.svg?style=flat-square)](LICENSE)

</div>

> ⚠️ **Active development toward `v1.0.0`.** Eight of the nine screens (Overview, Campaigns, Codes, Invitations, Referrals, Rewards, Waitlist, Anti-abuse) are built, tested, and themeable against the live core API; Settings lands once the core exposes its config read endpoint.

---

## 🚀 AI vibe-coding pack included

This repo ships a complete AI pair-programming kit: [`CLAUDE.md`](CLAUDE.md) (engineering invariants
+ quality gates) and [`AGENTS.md`](AGENTS.md). Point Claude Code, Cursor, or Copilot at the repo and
they inherit the package's rules (default-OFF mount tested in both states, no backend logic in the SPA,
prebuilt-asset discipline, the test-id + a11y contract) automatically.

---

## What it is

A **turnkey, default-OFF admin SPA** that mounts over the core package's HTTP API. It adds **no backend
logic of its own** — every data call goes through the core's existing `/api/admin/invitations/*` routes,
behind the host app's own auth + RBAC. Enable it, gate it, done.

For apps that already run their own React SPA (e.g. AskMyDocs), the screens can be **adapted natively**
instead of cross-mounting this package — the design template that drives both lives in the core repo at
[`docs/ADMIN-DESIGN-BRIEF.md`](https://github.com/padosoft/laravel-invitations/blob/main/docs/ADMIN-DESIGN-BRIEF.md).

## ✨ Highlights

- 🎛️ **Enterprise SaaS console feel** — Linear / Vercel / Stripe-grade layout: dense-but-breathable tables,
  sticky headers, slide-over drawers, confirm modals, toasts.
- 🌓 **Light + dark theming** via a `[data-theme]` token set — **no raw hex in components**, so a host can
  re-skin the whole panel by overriding the CSS custom properties.
- 🧩 **Reusable component kit** — `DataTable`, `KpiCard` (with sparkline + delta), `StatBadge`,
  `SlideOverDrawer`, `ConfirmModal`, `Toast`, `FilterBar`, `GrantEditor`, `ChipsInput`, `MaskedEmail`,
  `CopyButton`, `SegmentedTabs`, and dependency-free SVG charts (`Sparkline`, `FunnelChart`,
  `TimeSeriesChart`).
- 🏢 **Multi-tenant grant editor** — the campaign drawer's headline feature: a primary grant **plus**
  repeatable per-tenant grants, so a single invite code can seed role + project access across several
  tenants. `super-admin` is never offered.
- ♿ **Accessibility baked in** — real `<label htmlFor>` on every control, roles/aria on the focusable node,
  Esc + focus-trap in drawers/modals, status badges that pair color with text, full keyboard reach.
- 🧪 **Test-friendly by contract** — stable `feature-resource-{id}-{action}` test ids and
  `data-state="idle|loading|ready|error|empty"` on every async surface, so Playwright/Vitest can wait on
  state instead of timeouts.
- 🔌 **Zero JS toolchain for consumers** — the prebuilt Vite bundle is committed to `resources/dist/` and
  served straight from the package. `composer require` and flip a flag.
- 🔒 **Default-OFF, host-gated** — `INVITATIONS_ADMIN_ENABLED=false` out of the box; OFF means no routes and
  a clean 404; ON means a Blade shell behind your middleware stack.

## Screens

| Screen | What it does |
|---|---|
| **Overview** | KPI cards (K-factor, acceptance/conversion rate, codes, redemptions, distinct referrers, time-to-redeem p50/p90) + acquisition funnel, filtered by campaign + date range. |
| **Campaigns** | Sortable table (key, name, type, status, redemptions, window) + create/edit slide-over with the full **multi-tenant GrantEditor** + inline per-field validation. |
| **Codes** | Code table (copy, kind/state badges, uses progress, expiry) + campaign/state filters + generate drawer (with copy-all / CSV export) + destructive revoke confirm. |
| **Invitations** | Status tabs + masked recipients + an accepted-vs-pending-vs-expired breakdown bar + a bulk send drawer. |
| **Referrals** | Referrer → referee table + status filter (pending / qualified / rewarded / reversed) + campaign filter. |
| **Rewards** | Reward ledger (beneficiary, party, type, amount, trigger, state) + state + party filters. |
| **Waitlist** | Read-only queue ordered priority desc / position asc, masked emails, referral-count column + status filter. |
| **Anti-abuse** | Signal feed (hashed subject, signal type, severity, score, action taken) + severity + action filters. |

Settings is fully specified in the design brief and renders an informative "coming soon" placeholder until the
core exposes its config read endpoint.

## Install

```bash
composer require padosoft/laravel-invitations-admin
```

The package auto-registers. Publish the config to tune it:

```bash
php artisan vendor:publish --tag=laravel-invitations-admin-config
```

## Enable the mount

The mount is **OFF by default**. Turn it on and gate it with your admin middleware:

```dotenv
INVITATIONS_ADMIN_ENABLED=true
INVITATIONS_ADMIN_ROUTE_PREFIX=admin/invitations
INVITATIONS_ADMIN_API_BASE=/api/admin/invitations
INVITATIONS_ADMIN_TENANT_LABEL=acme
```

```php
// config/invitations-admin.php
return [
    'enabled'      => env('INVITATIONS_ADMIN_ENABLED', false),
    'route_prefix' => env('INVITATIONS_ADMIN_ROUTE_PREFIX', 'admin/invitations'),
    // The host supplies auth + RBAC here.
    'middleware'   => ['web', 'auth', 'can:manage-invitations'],
    'api_base'     => env('INVITATIONS_ADMIN_API_BASE', '/api/admin/invitations'),
    'tenant_label' => env('INVITATIONS_ADMIN_TENANT_LABEL', 'default'),
];
```

Visit `/admin/invitations` — the SPA boots and talks to the core API at `api_base` using the session cookie.
With `enabled=false` the route is absent and returns a clean 404.

## Theming

The whole palette is driven by CSS custom properties on `[data-theme]` (`resources/js/theme.css`). To re-skin,
override the token block in your own stylesheet loaded after the SPA bundle:

```css
[data-theme='light'] {
  --color-primary: #0d9488;
  --color-primary-soft: #ccfbf1;
}
```

The in-app theme toggle persists the user's choice to `localStorage`.

## Develop the SPA

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest + Testing Library
npm run typecheck  # tsc strict
npm run build      # emits resources/dist/ — commit the refreshed bundle
```

## Requires

[`padosoft/laravel-invitations`](https://github.com/padosoft/laravel-invitations) — the headless core that
owns the data, the HTTP API, and the MCP surface.

## Testing & quality gates

```bash
composer test       # PHPUnit (Testbench) — incl. the R43 default-OFF/ON mount test
vendor/bin/phpstan analyse   # level 5
vendor/bin/pint --test       # code style
npm run typecheck && npm test && npm run build
```

CI runs the PHP matrix (8.3 / 8.4 / 8.5 × Laravel 12 / 13) plus a JS build + test job on every push and PR.

## License

MIT © [Padosoft](https://www.padosoft.com)
