<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('roles')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->search, fn($q) => $q->where('name','like',"%{$request->search}%")->orWhere('email','like',"%{$request->search}%"))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()->paginate($request->per_page ?? 20);
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users',
            'role' => 'required|string', 'password' => 'sometimes|string|min:8']);
        $user = User::create(['name' => $request->name, 'email' => $request->email,
            'phone' => $request->phone, 'password' => Hash::make($request->password ?? 'EduNep@2082'),
            'institution_id' => $request->user()->institution_id, 'language' => $request->language ?? 'en']);
        $user->assignRole($request->role);
        return response()->json(['user' => $user->load('roles'), 'message' => __('messages.created')], 201);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        if ($user->institution_id !== $request->user()->institution_id) abort(403);
        return response()->json(['user' => $user->load('roles','student','staff')]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->institution_id !== $request->user()->institution_id) abort(403);
        $user->update($request->only('name','phone','language','status'));
        return response()->json(['user' => $user, 'message' => __('messages.updated')]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->institution_id !== $request->user()->institution_id) abort(403);
        $user->update(['status' => 'inactive']);
        return response()->json(['message' => __('messages.updated')]);
    }

    public function roles(): JsonResponse
    {
        return response()->json(['roles' => Role::where('guard_name','sanctum')->get()]);
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);
        $user->syncRoles([$request->role]);
        return response()->json(['message' => 'Role assigned.', 'user' => $user->load('roles')]);
    }
}
