# Laravel Invitations — Admin

> **React + Tailwind + Vite admin panel** for [`padosoft/laravel-invitations`](https://github.com/padosoft/laravel-invitations).
> Campaigns · codes · invitations (who accepted vs. not) · referral graph · reward ledger · waitlist · anti-abuse review · virality analytics.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/padosoft/laravel-invitations-admin.svg?style=flat-square)](https://packagist.org/packages/padosoft/laravel-invitations-admin)
[![License](https://img.shields.io/packagist/l/padosoft/laravel-invitations-admin.svg?style=flat-square)](LICENSE)

> ⚠️ **Under active development toward `v1.0.0`.** Scaffold published for Packagist
> registration; the SPA + gated mount land per the roadmap. Not production-ready yet.

## What it is

A turnkey, default-OFF admin SPA that mounts over the core package's HTTP API.
For apps that already run their own React SPA (e.g. AskMyDocs), the screens can
be adapted natively instead of cross-mounting this package — the design template
that drives both lives in the core repo at
[`docs/ADMIN-DESIGN-BRIEF.md`](https://github.com/padosoft/laravel-invitations/blob/main/docs/ADMIN-DESIGN-BRIEF.md).

Enabling the mount is opt-in (`INVITATIONS_ADMIN_ENABLED=true`) and sits behind
the host's admin auth + RBAC gate; with the flag off the routes are absent and
the path 404s cleanly.

## Requires

[`padosoft/laravel-invitations`](https://github.com/padosoft/laravel-invitations) (the headless core that owns the API).

## License

MIT © [Padosoft](https://www.padosoft.com)
