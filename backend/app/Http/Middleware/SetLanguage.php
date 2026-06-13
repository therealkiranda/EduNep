<?php
namespace App\Http\Middleware;
use Closure; use Illuminate\Http\Request; use Illuminate\Support\Facades\App;
class SetLanguage {
    public function handle(Request $request, Closure $next) {
        $lang = $request->header('Accept-Language', 'en');
        App::setLocale(in_array($lang, ['en','ne']) ? $lang : 'en');
        return $next($request);
    }
}
