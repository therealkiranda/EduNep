<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subjects = Subject::where('institution_id', $request->user()->institution_id)
            ->with('department')
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->latest()->get();
        return response()->json(['data' => $subjects]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255', 'type' => 'required|in:theory,practical,both',
            'code' => 'nullable|string|max:20', 'credit_hours' => 'nullable|integer|min:0']);
        $subject = Subject::create([
            ...$request->only('name','name_ne','code','department_id','credit_hours','type'),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $subject, 'message' => __('messages.created')], 201);
    }
    public function show(Request $request, Subject $subject): JsonResponse
    {
        if ($subject->institution_id !== $request->user()->institution_id) abort(403);
        return response()->json(['data' => $subject->load('department')]);
    }
    public function update(Request $request, Subject $subject): JsonResponse
    {
        if ($subject->institution_id !== $request->user()->institution_id) abort(403);
        $subject->update($request->only('name','name_ne','code','credit_hours','type'));
        return response()->json(['data' => $subject, 'message' => __('messages.updated')]);
    }
    public function destroy(Request $request, Subject $subject): JsonResponse
    {
        if ($subject->institution_id !== $request->user()->institution_id) abort(403);
        $subject->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
