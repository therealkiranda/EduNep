<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Payment;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function academic(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        $grades        = Grade::where('institution_id', $institutionId)->when($request->term_id, fn($q) => $q->where('term_id', $request->term_id));
        return response()->json([
            'summary'    => [['label' => 'Total Graded', 'value' => $grades->count()], ['label' => 'Avg GPA', 'value' => round($grades->avg('gpa'), 2)], ['label' => 'Pass Rate', 'value' => round($grades->where('grade','!=','F')->count() / max($grades->count(),1) * 100, 1).'%']],
            'monthly'    => Grade::where('institution_id', $institutionId)->select(DB::raw('MONTH(created_at) as month'), DB::raw('AVG(total) as value'))->groupBy('month')->orderBy('month')->get()->map(fn($r) => ['label' => date('M', mktime(0,0,0,$r->month,1)), 'value' => round($r->value, 1)]),
            'breakdown'  => Grade::where('institution_id', $institutionId)->select('grade', DB::raw('count(*) as value'))->groupBy('grade')->orderBy('grade')->get()->map(fn($r) => ['label' => $r->grade ?? 'N/A', 'value' => $r->value]),
        ]);
    }

    public function attendance(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        return response()->json([
            'summary'   => [['label' => 'Present Today', 'value' => Attendance::where('institution_id',$institutionId)->whereDate('date',today())->where('status','present')->count()], ['label' => 'Absent Today', 'value' => Attendance::where('institution_id',$institutionId)->whereDate('date',today())->where('status','absent')->count()]],
            'monthly'   => collect(range(1,12))->map(fn($m) => ['label' => date('M', mktime(0,0,0,$m,1)), 'value' => Attendance::where('institution_id',$institutionId)->whereMonth('date',$m)->whereYear('date',now()->year)->where('status','present')->count()]),
            'breakdown' => Attendance::where('institution_id',$institutionId)->select('status', DB::raw('count(*) as value'))->groupBy('status')->get()->map(fn($r) => ['label' => ucfirst($r->status), 'value' => $r->value]),
        ]);
    }

    public function finance(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        return response()->json([
            'summary'   => [['label' => 'Total Collected', 'value' => 'NPR '.number_format(Payment::where('institution_id',$institutionId)->where('status','completed')->sum('amount'))], ['label' => 'This Month', 'value' => 'NPR '.number_format(Payment::where('institution_id',$institutionId)->where('status','completed')->whereMonth('paid_at',now()->month)->sum('amount'))]],
            'monthly'   => Payment::where('institution_id',$institutionId)->where('status','completed')->select(DB::raw('MONTH(paid_at) as month'), DB::raw('SUM(amount) as value'))->groupBy('month')->orderBy('month')->get()->map(fn($r) => ['label' => date('M', mktime(0,0,0,$r->month,1)), 'value' => $r->value]),
            'breakdown' => Payment::where('institution_id',$institutionId)->where('status','completed')->select('method', DB::raw('SUM(amount) as value'))->groupBy('method')->get()->map(fn($r) => ['label' => str_replace('_',' ',ucfirst($r->method)), 'value' => $r->value]),
        ]);
    }

    public function enrollment(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        return response()->json([
            'summary'   => [['label' => 'Total Students', 'value' => Student::where('institution_id',$institutionId)->where('status','active')->count()], ['label' => 'New This Year', 'value' => Student::where('institution_id',$institutionId)->whereYear('created_at',now()->year)->count()]],
            'monthly'   => collect(range(1,12))->map(fn($m) => ['label' => date('M', mktime(0,0,0,$m,1)), 'value' => Student::where('institution_id',$institutionId)->whereMonth('created_at',$m)->whereYear('created_at',now()->year)->count()]),
            'breakdown' => Student::where('institution_id',$institutionId)->where('status','active')->select('gender', DB::raw('count(*) as value'))->groupBy('gender')->get()->map(fn($r) => ['label' => ucfirst($r->gender), 'value' => $r->value]),
        ]);
    }

    public function staff(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Staff report']);
    }
}
