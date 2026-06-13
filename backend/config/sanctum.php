<?php
return [
    'stateful'   => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1,edu.primelogic.com.np'
    )),
    'guard'      => ['web'],
    'expiration' => 60 * 24 * 30,
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies'      => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'verify_csrf_token'    => Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ],
];
