<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Invitations &amp; Growth</title>
    @if ($css)
        <link rel="stylesheet" href="{{ $css }}">
    @endif
    <script>
        // Same-origin config consumed by the SPA's axios client. The host owns
        // auth (session cookie); we only pass the API base + CSRF token + the
        // read-only active-tenant label for the top-bar indicator.
        window.InvitationsAdmin = {
            apiBase: @json($apiBase),
            csrfToken: @json(csrf_token()),
            tenantLabel: @json($tenantLabel),
        };
    </script>
</head>
<body>
    <div id="invitations-admin-root" data-testid="invitations-admin-root"></div>
    <script type="module" src="{{ $js }}"></script>
</body>
</html>
