<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function mark(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id'   => 'required|exists:classes,id',
            'date'       => 'required|date',
            'status'     => 'required|in:present,absent,late,excused',
            'subject_id' => 'nullable|exists:subjects,id',
            'note'       => 'nullable|string',
        ]);
        $att = Attendance::updateOrCreate(
            ['student_id' => $request->student_id, 'date' => $request->date, 'subject_id' => $request->subject_id],
            ['institution_id' => $request->user()->institution_id, 'class_id' => $request->class_id,
             'status' => $request->status, 'note' => $request->note, 'marked_by' => $request->user()->id]
        );
        return response()->json(['attendance' => $att, 'message' => __('messages.updated')]);
    }

    public function bulkMark(Request $request): JsonResponse
    {
        $request->validate(['records' => 'required|array', 'records.*.student_id' => 'required|exists:students,id',
            'records.*.date' => 'required|date', 'records.*.status' => 'required|in:present,absent,late,excused']);
        $institutionId = $request->user()->institution_id;
        $saved = [];
        foreach ($request->records as $rec) {
            $saved[] = Attendance::updateOrCreate(
                ['student_id' => $rec['student_id'], 'date' => $rec['date'], 'subject_id' => $rec['subject_id'] ?? null],
                ['institution_id' => $institutionId, 'class_id' => $rec['class_id'] ?? 0,
                 'status' => $rec['status'], 'marked_by' => $request->user()->id]
            );
        }
        return response()->json(['saved' => count($saved), 'message' => 'Attendance marked successfully.']);
    }

    public function today(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        $total   = Student::where('institution_id', $institutionId)->where('status', 'active')->count();
        $records = Attendance::with('student.user', 'class')
            ->where('institution_id', $institutionId)->whereDate('date', today())->get();
        $present = $records->where('status', 'present')->count();
        $absent  = $records->where('status', 'absent')->count();
        $late    = $records->where('status', 'late')->count();
        return response()->json(['date' => today()->format('Y-m-d'), 'total' => $total,
            'present' => $present, 'absent' => $absent, 'late' => $late,
            'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0, 'records' => $records]);
    }

    public function summary(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        $weekly = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = now()->subDays($i);
            $total   = Student::where('institution_id', $institutionId)->where('status','active')->count();
            $present = Attendance::where('institution_id', $institutionId)->whereDate('date', $date)->where('status','present')->count();
            $weekly[] = ['date' => $date->format('Y-m-d'), 'label' => $date->format('D'),
                'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0];
        }
        return response()->json(['weekly' => $weekly]);
    }

    public function studentReport(Request $request, $studentId): JsonResponse
    {
        $records = Attendance::where('student_id', $studentId)
            ->when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->whereDate('date', '<=', $request->to))
            ->get();
        $total   = $records->count();
        $present = $records->where('status','present')->count();
        return response()->json(['records' => $records, 'total' => $total, 'present' => $present,
            'absent' => $records->where('status','absent')->count(),
            'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0]);
    }

    public function classReport(Request $request, $classId): JsonResponse
    {
        $records = Attendance::with('student.user')->where('class_id', $classId)
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))->get();
        return response()->json(['records' => $records]);
    }
}
