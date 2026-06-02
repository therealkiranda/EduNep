<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => __('auth.inactive')], 403);
        }

        // 2FA check
        if ($user->two_factor_enabled) {
            if (! $request->otp) {
                return response()->json(['two_factor_required' => true], 200);
            }
            $google2fa = new Google2FA();
            if (! $google2fa->verifyKey($user->two_factor_secret, $request->otp)) {
                return response()->json(['message' => __('auth.invalid_otp')], 422);
            }
        }

        $user->tokens()->where('name', 'api')->delete();
        $token = $user->createToken('api')->plainTextToken;

        $user->load('roles.permissions');
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'token' => $token,
            'user'  => $this->userResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles.permissions', 'institution');
        return response()->json(['user' => $this->userResource($user)]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone'    => 'sometimes|string|max:20',
            'language' => 'sometimes|in:en,ne',
            'avatar'   => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->fill($request->only('name', 'phone', 'language'))->save();

        return response()->json(['user' => $this->userResource($user), 'message' => __('messages.profile_updated')]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => __('auth.wrong_password')], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();

        return response()->json(['message' => __('auth.password_changed')]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink($request->only('email'));
        return response()->json(['message' => __('passwords.sent')]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'),
            fn($user, $password) => $user->update(['password' => Hash::make($password)])
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __('passwords.reset')])
            : response()->json(['message' => __('passwords.token')], 422);
    }

    public function enable2FA(Request $request): JsonResponse
    {
        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();
        $user      = $request->user();
        $user->update(['two_factor_secret' => $secret, 'two_factor_enabled' => false]);
        $qrUrl = $google2fa->getQRCodeUrl(config('app.name'), $user->email, $secret);
        return response()->json(['secret' => $secret, 'qr_url' => $qrUrl]);
    }

    public function verify2FA(Request $request): JsonResponse
    {
        $request->validate(['otp' => 'required|string']);
        $user      = $request->user();
        $google2fa = new Google2FA();
        if (! $google2fa->verifyKey($user->two_factor_secret, $request->otp)) {
            return response()->json(['message' => __('auth.invalid_otp')], 422);
        }
        $user->update(['two_factor_enabled' => true]);
        return response()->json(['message' => '2FA enabled successfully.']);
    }

    private function userResource(User $user): array
    {
        return [
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'phone'               => $user->phone,
            'language'            => $user->language,
            'avatar'              => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'role'                => $user->roles->first()?->name,
            'permissions'         => $user->getAllPermissions()->pluck('name'),
            'institution_id'      => $user->institution_id,
            'two_factor_enabled'  => $user->two_factor_enabled,
            'last_login_at'       => $user->last_login_at,
        ];
    }
}
