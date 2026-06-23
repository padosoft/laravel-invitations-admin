# CLAUDE.md — padosoft/laravel-invitations-admin

Working rules for AI agents on this package. Mirrored for other tools in `AGENTS.md`.

## What this is

A **React + Tailwind + Vite admin SPA** for [`padosoft/laravel-invitations`](https://github.com/padosoft/laravel-invitations) (the headless core that owns the data + HTTP API + MCP). This package adds **no backend logic of its own** — it is a thin, default-OFF mount that serves a prebuilt SPA over the core's existing admin API. The authoritative design source is the core repo's [`docs/ADMIN-DESIGN-BRIEF.md`](https://github.com/padosoft/laravel-invitations/blob/main/docs/ADMIN-DESIGN-BRIEF.md).

## Stack & gates

- PHP `^8.3`; Laravel `^12|^13`; `spatie/laravel-package-tools`. `declare(strict_types=1)` everywhere.
- Frontend: React 19 + TypeScript (strict) + Tailwind v4 + Vite. Vitest + Testing Library for unit tests.
- **All gates must stay green before any push:**
  - `vendor/bin/phpunit` (Testbench)
  - `vendor/bin/phpstan analyse` (level 5, fix at source — no baselines)
  - `vendor/bin/pint --test`
  - `npm run typecheck && npm test && npm run build`
- CI matrix: PHP 8.3/8.4/8.5 × Laravel 12/13, plus a JS build/test job.

## Non-negotiable invariants

1. **Default-OFF mount, tested in BOTH states (R43).** `invitations-admin.enabled` is `false` by default; OFF ⇒ no routes registered ⇒ the path 404s cleanly. ON ⇒ the gated Blade shell is reachable. `tests/MountTest.php` covers both — never let only the ON path ship.
2. **The SPA is the only frontend; the core owns the data.** No business logic, no direct DB access here. Every data call goes through the core's `/api/admin/invitations/*` routes via the same-origin axios client.
3. **The mount is gated by the host.** The `invitations-admin.middleware` config supplies the host's auth + RBAC; this package never bakes in its own auth.
4. **Prebuilt assets are committed.** `resources/dist/` ships in the repo so consumers need no JS toolchain. Rebuild (`npm run build`) and commit whenever the SPA changes.
5. **Loud failures, never silent (R14).** A missing bundle 500s with a clear message; API errors surface in the DOM (toast + per-field `{field}-error`); empty arrays render the friendly empty state, never a blank table.
6. **Field-accurate data shapes (R9).** `resources/js/types.ts` is copied verbatim from the design brief §10. Keep it in lockstep with the core's resources.
7. **testid + a11y contract (R11/R15).** Stable `feature-resource-{id}-{action}` testids on actionable elements; real `<label htmlFor>` (placeholder is not a label); roles/aria on the focusable node; Esc + focus trap in drawers/modals; status badges pair color with text.

## Architecture

```
Blade shell (gated route)  ─►  React SPA (resources/js)
                                  └─► axios (same-origin, session cookie)
                                        └─► core /api/admin/invitations/* (campaigns, codes, tenants, metrics, invitations)
```

- `resources/js/api/` — the only external boundary (client + endpoint wrappers).
- `resources/js/components/` — reusable themeable kit (DataTable, KpiCard, StatBadge, SlideOverDrawer, ConfirmModal, Toast, GrantEditor, ChipsInput, charts, …). Components are controlled (`value`/`onChange`); state lifts to the lowest common parent.
- `resources/js/screens/` — Overview, Campaigns, Codes, Invitations (the v1.0 subset). The remaining design-brief sections render an informative placeholder until the core exposes their read endpoints.
- `resources/js/theme.css` — light/dark tokens via `[data-theme]`. No raw hex in components.

## Releases

Single branch → `main` (fresh package, direct-to-main for the initial build is fine). Copilot/critic review loop until 0 must-fix + CI green. Tag `vX.Y.Z` only when asked. WOW community README is the deliverable before `v1.0.0`.
