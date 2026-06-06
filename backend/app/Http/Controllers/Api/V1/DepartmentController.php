<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $departments = Department::where('institution_id', $request->user()->institution_id)
            ->with('hod')->latest()->get();
        return response()->json(['data' => $departments]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:20']);
        $dept = Department::create([
            ...$request->only('name','name_ne','code','hod_id'),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $dept, 'message' => __('messages.created')], 201);
    }
    public function show(Department $department): JsonResponse
    {
        return response()->json(['data' => $department->load('hod')]);
    }
    public function update(Request $request, Department $department): JsonResponse
    {
        if ($department->institution_id !== $request->user()->institution_id) abort(403);
        $department->update($request->only('name','name_ne','code','hod_id'));
        return response()->json(['data' => $department, 'message' => __('messages.updated')]);
    }
    public function destroy(Request $request, Department $department): JsonResponse
    {
        if ($department->institution_id !== $request->user()->institution_id) abort(403);
        $department->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
