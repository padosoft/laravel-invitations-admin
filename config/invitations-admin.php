<?php

declare(strict_types=1);

/**
 * Configuration for padosoft/laravel-invitations-admin.
 *
 * Scaffold stage (Phase 0a): minimal stub. The admin SPA mount is default-OFF;
 * enabling it serves the prebuilt React panel at the configured route behind
 * the host's admin auth + RBAC gate. With the flag off the routes are not
 * registered and the path 404s cleanly (R43 — tested in both states).
 */
return [
    // Master switch. Default OFF so a fresh install adds nothing until opted in.
    'enabled' => (bool) env('INVITATIONS_ADMIN_ENABLED', false),

    // Where the admin SPA mounts when enabled.
    'route_prefix' => env('INVITATIONS_ADMIN_ROUTE_PREFIX', 'admin/invitations'),

    // Middleware stack guarding the mount (host supplies auth + RBAC).
    'middleware' => ['web'],
];
