# AGENTS.md

This package ships an AI vibe-coding pack. The working rules for AI agents live in
[`CLAUDE.md`](CLAUDE.md) — read it first. The authoritative UI design source is the core
repo's [`docs/ADMIN-DESIGN-BRIEF.md`](https://github.com/padosoft/laravel-invitations/blob/main/docs/ADMIN-DESIGN-BRIEF.md).

## Quick gates before any push (all must be green)

```bash
# PHP
vendor/bin/phpunit
vendor/bin/phpstan analyse --no-progress --memory-limit=512M   # level 5, fix at source
vendor/bin/pint --test

# JavaScript / TypeScript
npm run typecheck
npm test
npm run build        # commit the refreshed resources/dist/ bundle
```

## Golden rules

- The mount is **default-OFF** and must be tested in BOTH states (R43) — see `tests/MountTest.php`.
- No backend logic here: the SPA consumes the core package's `/api/admin/invitations/*` API.
- Commit the prebuilt `resources/dist/` bundle so consumers need no JS toolchain.
- Stable `feature-resource-{id}-{action}` test ids + full keyboard/a11y on every interactive element.
- Surface failures loudly (toast + per-field errors + empty states) — never a silent 200/blank.
