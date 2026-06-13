<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        apiPrefix: 'api',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [\App\Http\Middleware\SetLanguage::class]);
        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $r) {
            if ($r->expectsJson()) return response()->json(['message' => 'Unauthenticated.'], 401);
        });
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, \Illuminate\Http\Request $r) {
            if ($r->expectsJson()) return response()->json(['message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        });
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $r) {
            if ($r->expectsJson()) return response()->json(['message' => 'Not found.'], 404);
        });
    })->create();
