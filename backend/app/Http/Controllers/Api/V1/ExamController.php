<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $exams = Exam::with('subject','class','term')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->class_id,   fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->subject_id, fn($q) => $q->where('subject_id', $request->subject_id))
            ->when($request->status,     fn($q) => $q->where('status', $request->status))
            ->latest()->paginate(20);
        return response()->json($exams);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string', 'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id', 'exam_date' => 'required|date',
            'total_marks' => 'required|integer|min:1', 'pass_marks' => 'required|integer|min:1',
            'type' => 'required|in:written,mcq,practical,oral,mixed']);
        $exam = Exam::create([...$request->only('name','class_id','subject_id','term_id','exam_date','duration_mins','total_marks','pass_marks','type'),
            'institution_id' => $request->user()->institution_id, 'status' => 'draft']);
        return response()->json(['exam' => $exam, 'message' => __('messages.created')], 201);
    }

    public function show(Request $request, Exam $exam): JsonResponse
    {
        $this->checkTenant($exam, $request->user());
        return response()->json(['exam' => $exam->load('subject','class','term','questions')]);
    }

    public function update(Request $request, Exam $exam): JsonResponse
    {
        $this->checkTenant($exam, $request->user());
        $exam->update($request->only('name','exam_date','duration_mins','total_marks','pass_marks','type','status'));
        return response()->json(['exam' => $exam, 'message' => __('messages.updated')]);
    }

    public function destroy(Request $request, Exam $exam): JsonResponse
    {
        $this->checkTenant($exam, $request->user());
        $exam->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }

    public function publish(Request $request, Exam $exam): JsonResponse
    {
        $this->checkTenant($exam, $request->user());
        $exam->update(['status' => 'published']);
        return response()->json(['message' => 'Exam published successfully.', 'exam' => $exam]);
    }

    public function results(Request $request, Exam $exam): JsonResponse
    {
        $this->checkTenant($exam, $request->user());
        $results = ExamResult::with('student.user')->where('exam_id', $exam->id)->get();
        return response()->json(['results' => $results, 'total_students' => $results->count(),
            'passed' => $results->where('status','pass')->count(),
            'failed' => $results->where('status','fail')->count(),
            'average' => $results->avg('marks_obtained')]);
    }

    public function gradeEssay(Request $request, Exam $exam): JsonResponse
    {
        $request->validate(['student_id' => 'required|exists:students,id',
            'marks_obtained' => 'required|numeric|min:0', 'remarks' => 'nullable|string']);
        $status = $request->marks_obtained >= $exam->pass_marks ? 'pass' : 'fail';
        $result = ExamResult::updateOrCreate(
            ['exam_id' => $exam->id, 'student_id' => $request->student_id],
            ['marks_obtained' => $request->marks_obtained, 'status' => $status,
             'remarks' => $request->remarks, 'graded_by' => $request->user()->id]
        );
        return response()->json(['result' => $result, 'message' => 'Result saved.']);
    }

    public function submitAnswers(Request $request, Exam $exam): JsonResponse
    {
        $request->validate(['answers' => 'required|array']);
        $questions = $exam->questions()->where('type','mcq')->get()->keyBy('id');
        $total     = 0;
        foreach ($request->answers as $qId => $answer) {
            $q = $questions[$qId] ?? null;
            if ($q && $q->correct_answer === $answer) $total += $q->marks;
        }
        $status = $total >= $exam->pass_marks ? 'pass' : 'fail';
        $result = ExamResult::updateOrCreate(
            ['exam_id' => $exam->id, 'student_id' => $request->user()->student->id ?? 0],
            ['marks_obtained' => $total, 'status' => $status]
        );
        return response()->json(['result' => $result, 'score' => $total, 'status' => $status]);
    }

    private function checkTenant($model, $user): void
    {
        if ($model->institution_id !== $user->institution_id) abort(403);
    }
}
