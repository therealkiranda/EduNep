<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $assignments = Assignment::with('classSubject.class','classSubject.subject','classSubject.teacher')
            ->whereHas('classSubject', fn($q) => $q->whereHas('class',
                fn($q2) => $q2->where('institution_id', $request->user()->institution_id)))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()->paginate(20);
        return response()->json($assignments);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['title' => 'required|string|max:255', 'class_subject_id' => 'required|exists:class_subjects,id',
            'due_date' => 'required|date|after:now', 'max_marks' => 'required|integer|min:1',
            'description' => 'nullable|string', 'allow_late' => 'boolean']);
        $assignment = Assignment::create([...$request->only('title','description','class_subject_id','due_date','max_marks','allow_late'),
            'created_by' => $request->user()->id, 'status' => 'published']);
        return response()->json(['assignment' => $assignment->load('classSubject'), 'message' => __('messages.created')], 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        return response()->json(['assignment' => $assignment->load('classSubject.class','classSubject.subject','submissions')]);
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $assignment->update($request->only('title','description','due_date','max_marks','allow_late','status'));
        return response()->json(['assignment' => $assignment, 'message' => __('messages.updated')]);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }

    public function submit(Request $request, Assignment $assignment): JsonResponse
    {
        $request->validate(['text_answer' => 'nullable|string', 'file' => 'nullable|file|max:10240']);
        $fileUrl = null;
        if ($request->hasFile('file')) {
            $fileUrl = $request->file('file')->store("submissions/{$assignment->id}", 'public');
        }
        $isLate  = now()->isAfter($assignment->due_date);
        $sub = Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $request->user()->student->id],
            ['text_answer' => $request->text_answer, 'file_url' => $fileUrl,
             'submitted_at' => now(), 'is_late' => $isLate, 'status' => 'submitted']
        );
        return response()->json(['submission' => $sub, 'message' => 'Assignment submitted.']);
    }

    public function submissions(Assignment $assignment): JsonResponse
    {
        $submissions = $assignment->submissions()->with('student.user')->get();
        return response()->json(['submissions' => $submissions,
            'total' => $submissions->count(), 'graded' => $submissions->where('status','graded')->count()]);
    }

    public function grade(Request $request, Assignment $assignment): JsonResponse
    {
        $request->validate(['student_id' => 'required|exists:students,id',
            'marks' => 'required|numeric|min:0', 'feedback' => 'nullable|string']);
        $sub = Submission::where('assignment_id', $assignment->id)
            ->where('student_id', $request->student_id)->firstOrFail();
        $sub->update(['marks' => $request->marks, 'feedback' => $request->feedback,
            'status' => 'graded', 'graded_by' => $request->user()->id, 'graded_at' => now()]);
        return response()->json(['submission' => $sub, 'message' => 'Graded successfully.']);
    }
}
