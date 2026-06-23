<?php

declare(strict_types=1);

/**
 * Configuration for padosoft/laravel-invitations-admin.
 *
 * The admin SPA mount is default-OFF. Enabling it serves the prebuilt React
 * panel at the configured route behind the host's admin auth + RBAC gate. With
 * the flag off the routes are NOT registered and the path 404s cleanly (R43 —
 * tested in both states).
 */
return [
    // Master switch. Default OFF so a fresh install adds nothing until opted in.
    'enabled' => (bool) env('INVITATIONS_ADMIN_ENABLED', false),

    // Where the admin SPA shell mounts when enabled (a GET that returns the
    // Blade-rendered SPA). The SPA then talks to the core API at `api_base`.
    'route_prefix' => env('INVITATIONS_ADMIN_ROUTE_PREFIX', 'admin/invitations'),

    // Middleware stack guarding the mount. The host supplies auth + RBAC here
    // (e.g. ['web', 'auth', 'can:manage-invitations']).
    'middleware' => ['web'],

    // Base URL the SPA's API client targets. Defaults to the core package's
    // admin route group; override if the host mounts the core API elsewhere.
    'api_base' => env('INVITATIONS_ADMIN_API_BASE', '/api/admin/invitations'),

    // Read-only label shown in the top-bar tenant indicator. Tenant switching
    // is the host app's job; this is purely informational. A host can bind a
    // dynamic value via config() at runtime.
    'tenant_label' => env('INVITATIONS_ADMIN_TENANT_LABEL', 'default'),
];
