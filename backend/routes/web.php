<?php
use Illuminate\Support\Facades\Route;
Route::get('/', fn() => response()->json(['app'=>'EduNep API','version'=>'1.0.0','status'=>'running']));
Route::get('/up', fn() => response()->json(['status'=>'ok','time'=>now()]));
