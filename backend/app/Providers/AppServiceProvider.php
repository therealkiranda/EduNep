<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
class AppServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->app->singleton(\App\Services\NepaliDateService::class);
        $this->app->singleton(\App\Services\PdfService::class);
    }
    public function boot(): void { \Illuminate\Support\Facades\Schema::defaultStringLength(191); }
}
