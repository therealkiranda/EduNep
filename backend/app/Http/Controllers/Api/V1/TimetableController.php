<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TimetableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $timetables = Timetable::with('classSubject.subject','classSubject.teacher','class')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->orderBy('day_of_week')->orderBy('start_time')->get();
        return response()->json(['data' => $timetables]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'class_id'         => 'required|exists:classes,id',
            'class_subject_id' => 'required|exists:class_subjects,id',
            'day_of_week'      => 'required|integer|between:0,6',
            'start_time'       => 'required|date_format:H:i',
            'end_time'         => 'required|date_format:H:i|after:start_time',
            'room'             => 'nullable|string|max:50',
        ]);
        $tt = Timetable::create([
            ...$request->only('class_id','class_subject_id','day_of_week','start_time','end_time','room'),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $tt->load('classSubject.subject'), 'message' => __('messages.created')], 201);
    }
    public function show(Timetable $timetable): JsonResponse
    {
        return response()->json(['data' => $timetable->load('classSubject.subject','classSubject.teacher')]);
    }
    public function update(Request $request, Timetable $timetable): JsonResponse
    {
        if ($timetable->institution_id !== $request->user()->institution_id) abort(403);
        $timetable->update($request->only('day_of_week','start_time','end_time','room'));
        return response()->json(['data' => $timetable, 'message' => __('messages.updated')]);
    }
    public function destroy(Request $request, Timetable $timetable): JsonResponse
    {
        if ($timetable->institution_id !== $request->user()->institution_id) abort(403);
        $timetable->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
