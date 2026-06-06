<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function __construct(private PdfService $pdf) {}

    public function index(Request $request): JsonResponse
    {
        $grades = Grade::with('student.user','subject','term')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->term_id,    fn($q) => $q->where('term_id', $request->term_id))
            ->when($request->subject_id, fn($q) => $q->where('subject_id', $request->subject_id))
            ->paginate(50);
        return response()->json($grades);
    }

    public function bulkEntry(Request $request): JsonResponse
    {
        $request->validate(['grades' => 'required|array',
            'grades.*.student_id'  => 'required|exists:students,id',
            'grades.*.subject_id'  => 'required|exists:subjects,id',
            'grades.*.term_id'     => 'required|exists:terms,id',
            'grades.*.ca_marks'    => 'required|numeric|min:0',
            'grades.*.exam_marks'  => 'required|numeric|min:0',
        ]);
        $institutionId = $request->user()->institution_id;
        foreach ($request->grades as $g) {
            $total = $g['ca_marks'] + $g['exam_marks'];
            $gradeLabel = $this->calcGrade($total);
            Grade::updateOrCreate(
                ['student_id' => $g['student_id'], 'subject_id' => $g['subject_id'], 'term_id' => $g['term_id']],
                ['institution_id' => $institutionId, 'ca_marks' => $g['ca_marks'],
                 'exam_marks' => $g['exam_marks'], 'total' => $total,
                 'grade' => $gradeLabel['grade'], 'gpa' => $gradeLabel['gpa'],
                 'remarks' => $g['remarks'] ?? null]
            );
        }
        return response()->json(['message' => 'Grades saved successfully.', 'count' => count($request->grades)]);
    }

    public function student(Request $request, $studentId): JsonResponse
    {
        $student = Student::where('institution_id', $request->user()->institution_id)->findOrFail($studentId);
        $grades  = Grade::with('subject','term')->where('student_id', $studentId)->get();
        return response()->json(['student' => $student->load('user','class'),
            'grades' => $grades, 'avg_gpa' => $grades->avg('gpa'), 'avg_total' => $grades->avg('total')]);
    }

    public function classGrades(Request $request, $classId): JsonResponse
    {
        $grades = Grade::with('student.user','subject')
            ->whereHas('student', fn($q) => $q->where('class_id', $classId))
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->term_id, fn($q) => $q->where('term_id', $request->term_id))->get();
        return response()->json(['grades' => $grades]);
    }

    public function reportCard(Request $request, $studentId)
    {
        $student = Student::with('user','class','institution','grades.subject')->findOrFail($studentId);
        $this->checkTenant($student, $request->user());
        return $this->pdf->generateReportCard($student)->download("report-card-{$studentId}.pdf");
    }

    private function calcGrade(float $total): array
    {
        if ($total >= 90) return ['grade' => 'A+', 'gpa' => 4.0];
        if ($total >= 80) return ['grade' => 'A',  'gpa' => 3.6];
        if ($total >= 70) return ['grade' => 'B+', 'gpa' => 3.2];
        if ($total >= 60) return ['grade' => 'B',  'gpa' => 2.8];
        if ($total >= 50) return ['grade' => 'C+', 'gpa' => 2.4];
        if ($total >= 40) return ['grade' => 'C',  'gpa' => 2.0];
        if ($total >= 35) return ['grade' => 'D',  'gpa' => 1.6];
        return ['grade' => 'F', 'gpa' => 0.0];
    }

    private function checkTenant($model, $user): void
    {
        if ($model->institution_id !== $user->institution_id) abort(403);
    }
}
