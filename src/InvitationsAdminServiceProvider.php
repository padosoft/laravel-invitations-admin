<?php

declare(strict_types=1);

namespace Padosoft\Invitations\Admin;

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

/**
 * Service provider for padosoft/laravel-invitations-admin.
 *
 * Serves the prebuilt React + Tailwind + Vite admin SPA (built from the core
 * repo's docs/ADMIN-DESIGN-BRIEF.md) over the core package's HTTP API. The
 * mount is default-OFF: with `invitations-admin.enabled` false no routes are
 * registered and the path 404s cleanly (R43). When enabled, a gated Blade
 * route (config middleware) returns the SPA shell, and a sibling asset route
 * serves the hashed JS/CSS bundles straight from the package's resources/dist
 * so a consumer never needs a JS toolchain or a vendor:publish step.
 */
final class InvitationsAdminServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('laravel-invitations-admin')
            ->hasConfigFile('invitations-admin')
            ->hasViews('invitations-admin');
    }

    public function packageBooted(): void
    {
        if (! (bool) config('invitations-admin.enabled', false)) {
            return;
        }

        $this->registerSpaRoutes();
    }

    private function registerSpaRoutes(): void
    {
        $prefix = trim((string) config('invitations-admin.route_prefix', 'admin/invitations'), '/');
        $middleware = (array) config('invitations-admin.middleware', ['web']);

        Route::middleware($middleware)
            ->prefix($prefix)
            ->group(function (): void {
                Route::get('/', fn () => $this->renderShell())
                    ->name('invitations-admin.spa');
            });

        // Asset route — serves the prebuilt bundle from resources/dist. Kept
        // outside the auth middleware-heavy shell group is unnecessary: the
        // bundle is non-secret static JS/CSS, but we keep it under the same
        // prefix + middleware so a consumer's gate covers everything uniformly.
        Route::middleware($middleware)
            ->prefix($prefix)
            ->group(function (): void {
                Route::get('assets/{file}', fn (string $file) => $this->serveAsset($file))
                    ->where('file', '[A-Za-z0-9._-]+')
                    ->name('invitations-admin.asset');
            });
    }

    /**
     * Render the SPA shell, resolving the hashed entry asset URLs from the
     * Vite manifest. Throws (surfaced as a 500) if the bundle is missing — a
     * loud failure beats a blank page (R14).
     */
    private function renderShell(): View
    {
        $manifest = $this->manifest();
        $entry = $manifest['resources/js/main.tsx'] ?? null;

        if ($entry === null || ! isset($entry['file'])) {
            abort(500, 'Invitations admin SPA bundle is not built. Run `npm run build` in the package.');
        }

        $prefix = trim((string) config('invitations-admin.route_prefix', 'admin/invitations'), '/');
        $assetBase = url($prefix.'/assets');

        $css = null;
        if (! empty($entry['css'][0])) {
            $css = $assetBase.'/'.basename((string) $entry['css'][0]);
        }

        /** @var ViewFactory $views */
        $views = app(ViewFactory::class);

        return $views->make('invitations-admin::app', [
            'js' => $assetBase.'/'.basename((string) $entry['file']),
            'css' => $css,
            'apiBase' => (string) config('invitations-admin.api_base', '/api/admin/invitations'),
            'tenantLabel' => (string) config('invitations-admin.tenant_label', 'default'),
        ]);
    }

    private function serveAsset(string $file): mixed
    {
        $path = $this->distPath('assets/'.$file);

        if (! is_file($path)) {
            abort(404);
        }

        $contentType = str_ends_with($file, '.css') ? 'text/css' : 'application/javascript';

        /** @var ResponseFactory $factory */
        $factory = app(ResponseFactory::class);

        return $factory->make((string) file_get_contents($path), 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    /**
     * @return array<string, array{file?: string, css?: array<int, string>}>
     */
    private function manifest(): array
    {
        $path = $this->distPath('.vite/manifest.json');
        if (! is_file($path)) {
            return [];
        }

        /** @var array<string, array{file?: string, css?: array<int, string>}> $decoded */
        $decoded = json_decode((string) file_get_contents($path), true) ?: [];

        return $decoded;
    }

    private function distPath(string $relative): string
    {
        return dirname(__DIR__).'/resources/dist/'.$relative;
    }
}
