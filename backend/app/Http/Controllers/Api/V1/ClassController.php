<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $classes = SchoolClass::where('institution_id', $request->user()->institution_id)
            ->with('department','sections')
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->latest()->get();
        return response()->json(['data' => $classes]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255', 'capacity' => 'nullable|integer|min:1']);
        $class = SchoolClass::create([
            ...$request->only('name','name_ne','department_id','level','stream','capacity'),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $class, 'message' => __('messages.created')], 201);
    }
    public function show(Request $request, SchoolClass $class): JsonResponse
    {
        if ($class->institution_id !== $request->user()->institution_id) abort(403);
        return response()->json(['data' => $class->load('department','sections','subjects.subject')]);
    }
    public function update(Request $request, SchoolClass $class): JsonResponse
    {
        if ($class->institution_id !== $request->user()->institution_id) abort(403);
        $class->update($request->only('name','name_ne','department_id','level','stream','capacity'));
        return response()->json(['data' => $class, 'message' => __('messages.updated')]);
    }
    public function destroy(Request $request, SchoolClass $class): JsonResponse
    {
        if ($class->institution_id !== $request->user()->institution_id) abort(403);
        $class->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
    public function students(SchoolClass $class): JsonResponse
    {
        return response()->json(['students' => $class->students()->with('user','section')->get()]);
    }
    public function timetable(SchoolClass $class): JsonResponse
    {
        return response()->json(['timetable' => $class->timetables()->with('classSubject.subject','classSubject.teacher')->orderBy('day_of_week')->orderBy('start_time')->get()]);
    }
}
