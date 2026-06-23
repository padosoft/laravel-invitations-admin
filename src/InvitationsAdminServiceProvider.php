<?php

declare(strict_types=1);

namespace Padosoft\Invitations\Admin;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

/**
 * Service provider for padosoft/laravel-invitations-admin.
 *
 * Scaffold stage (Phase 0a): wires the config file only. In Phase 3 this
 * registers a default-OFF, gated Blade mount that serves the prebuilt
 * React + Tailwind + Vite admin SPA (built from docs/ADMIN-DESIGN-BRIEF.md in
 * the core repo) over the core package's HTTP API. OFF path = clean 404 (R43).
 */
final class InvitationsAdminServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('laravel-invitations-admin')
            ->hasConfigFile('invitations-admin');
    }
}
