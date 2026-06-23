<?php

declare(strict_types=1);

namespace Padosoft\Invitations\Admin\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use Padosoft\Invitations\Admin\InvitationsAdminServiceProvider;

abstract class TestCase extends Orchestra
{
    /**
     * @return array<int, class-string>
     */
    protected function getPackageProviders($app): array
    {
        return [
            InvitationsAdminServiceProvider::class,
        ];
    }
}
