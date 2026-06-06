<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InstitutionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $institutions = Institution::when(!$request->user()->hasRole('super_admin'),
            fn($q) => $q->where('id', $request->user()->institution_id))->paginate(20);
        return response()->json($institutions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255', 'type' => 'required|in:school,college,both',
            'email' => 'required|email|unique:institutions', 'phone' => 'required|string']);
        $inst = Institution::create($request->only('name','name_ne','type','address','city','district',
            'province','phone','email','website','currency','timezone','language'));
        return response()->json(['institution' => $inst, 'message' => __('messages.created')], 201);
    }

    public function show(Request $request, Institution $institution): JsonResponse
    {
        if (!$request->user()->hasRole('super_admin') && $institution->id !== $request->user()->institution_id) abort(403);
        return response()->json(['institution' => $institution]);
    }

    public function update(Request $request, Institution $institution): JsonResponse
    {
        if (!$request->user()->hasRole('super_admin') && $institution->id !== $request->user()->institution_id) abort(403);
        $institution->update($request->only('name','name_ne','address','city','district','province',
            'phone','email','website','currency','timezone','language','theme_color','slogan','slogan_ne'));
        return response()->json(['institution' => $institution, 'message' => __('messages.updated')]);
    }

    public function destroy(Institution $institution): JsonResponse
    {
        $institution->update(['status' => 'inactive']);
        return response()->json(['message' => __('messages.updated')]);
    }

    public function uploadLogo(Request $request, Institution $institution): JsonResponse
    {
        $request->validate(['logo' => 'required|image|max:2048']);
        $path = $request->file('logo')->store("logos/{$institution->id}", 'public');
        $institution->update(['logo' => $path]);
        return response()->json(['logo' => asset('storage/'.$path)]);
    }
}
