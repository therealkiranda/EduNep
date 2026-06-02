<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\NepaliDateService;
use App\Services\PdfService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NepaliDateService::class);
        $this->app->singleton(PdfService::class);
    }

    public function boot(): void
    {
        // Set default string length for MySQL
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);
    }
}
