<?php

declare(strict_types=1);

namespace Padosoft\Invitations\Admin\Tests;

use PHPUnit\Framework\Attributes\Test;

/**
 * R43 — the default-OFF feature flag is exercised in BOTH states. With the
 * mount disabled the SPA route must 404 cleanly; with it enabled the shell
 * must be reachable and render the React root + the same-origin config.
 *
 * The flag is read at boot time (packageBooted), so each test seeds its config
 * via defineEnvironment() — which Testbench runs BEFORE the provider boots —
 * rather than mutating config() after the fact.
 */
final class MountTest extends TestCase
{
    /** @var array<string, mixed> */
    private array $configOverrides = [];

    protected function defineEnvironment($app): void
    {
        foreach ($this->configOverrides as $key => $value) {
            $app['config']->set($key, $value);
        }
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function bootWith(array $overrides): void
    {
        $this->configOverrides = $overrides;
        $this->refreshApplication();
    }

    #[Test]
    public function the_spa_route_404s_when_the_mount_is_disabled(): void
    {
        $this->bootWith(['invitations-admin.enabled' => false]);

        $this->get('/admin/invitations')->assertNotFound();
        $this->get('/admin/invitations/assets/main.js')->assertNotFound();
    }

    #[Test]
    public function the_spa_shell_is_reachable_when_the_mount_is_enabled(): void
    {
        $this->bootWith([
            'invitations-admin.enabled' => true,
            'invitations-admin.middleware' => ['web'],
        ]);

        $response = $this->get('/admin/invitations');

        $response->assertOk();
        $response->assertSee('invitations-admin-root', false);
        $response->assertSee('window.InvitationsAdmin', false);
    }

    #[Test]
    public function the_shell_injects_the_api_base_and_tenant_label(): void
    {
        $this->bootWith([
            'invitations-admin.enabled' => true,
            'invitations-admin.api_base' => '/api/admin/invitations',
            'invitations-admin.tenant_label' => 'acme',
        ]);

        $response = $this->get('/admin/invitations');

        $response->assertOk();
        // @json escapes forward slashes in the injected config object.
        $response->assertSee('\/api\/admin\/invitations', false);
        $response->assertSee('"acme"', false);
    }

    #[Test]
    public function a_built_js_asset_is_served_when_enabled(): void
    {
        $this->bootWith(['invitations-admin.enabled' => true]);

        // Resolve the hashed entry filename from the committed manifest.
        $manifest = json_decode(
            (string) file_get_contents(dirname(__DIR__).'/resources/dist/.vite/manifest.json'),
            true,
        );
        $file = basename((string) ($manifest['resources/js/main.tsx']['file'] ?? ''));
        $this->assertNotSame('', $file, 'The Vite manifest must expose a built entry file.');

        $response = $this->get('/admin/invitations/assets/'.$file);

        $response->assertOk();
        $this->assertStringContainsString('javascript', strtolower((string) $response->headers->get('Content-Type')));
    }
}
