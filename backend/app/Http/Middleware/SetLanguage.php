<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLanguage
{
    public function handle(Request $request, Closure $next)
    {
        $lang = $request->header('Accept-Language', 'en');
        $supported = ['en', 'ne'];
        $locale = in_array($lang, $supported) ? $lang : 'en';
        App::setLocale($locale);
        return $next($request);
    }
}
