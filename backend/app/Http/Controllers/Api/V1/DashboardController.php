<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Attendance;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Announcement;
use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;

        $stats = [
            'total_students'   => Student::where('institution_id', $institutionId)->where('status', 'active')->count(),
            'total_staff'      => Staff::where('institution_id', $institutionId)->where('status', 'active')->count(),
            'today_attendance' => $this->todayAttendanceRate($institutionId),
            'fees_this_month'  => Payment::where('institution_id', $institutionId)
                                    ->whereMonth('paid_at', now()->month)
                                    ->whereYear('paid_at', now()->year)
                                    ->sum('amount'),
            'pending_invoices' => Invoice::where('institution_id', $institutionId)->where('status', 'unpaid')->count(),
            'fee_defaulters'   => Invoice::where('institution_id', $institutionId)
                                    ->where('status', 'unpaid')
                                    ->where('due_date', '<', now())
                                    ->count(),
        ];

        $recentPayments = Payment::with('student', 'invoice')
            ->where('institution_id', $institutionId)
            ->latest('paid_at')->limit(5)->get();

        $announcements = Announcement::where('institution_id', $institutionId)
            ->where('status', 'published')
            ->latest('published_at')->limit(5)->get();

        $upcomingEvents = CalendarEvent::where('institution_id', $institutionId)
            ->where('start_date', '>=', now())
            ->orderBy('start_date')->limit(5)->get();

        return response()->json(compact('stats', 'recentPayments', 'announcements', 'upcomingEvents'));
    }

    public function stats(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;

        return response()->json([
            'enrollment_by_class' => Student::where('institution_id', $institutionId)
                ->where('status', 'active')
                ->select('class_id', DB::raw('count(*) as total'))
                ->with('class:id,name')
                ->groupBy('class_id')->get(),

            'gender_breakdown' => Student::where('institution_id', $institutionId)
                ->where('status', 'active')
                ->select('gender', DB::raw('count(*) as total'))
                ->groupBy('gender')->get(),

            'attendance_this_week' => $this->weeklyAttendance($institutionId),

            'fee_collection_trend' => Payment::where('institution_id', $institutionId)
                ->select(DB::raw('MONTH(paid_at) as month'), DB::raw('SUM(amount) as total'))
                ->whereYear('paid_at', now()->year)
                ->groupBy('month')
                ->orderBy('month')->get(),
        ]);
    }

    public function charts(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        $months = collect(range(1, 12))->map(fn($m) => [
            'month' => $m,
            'label' => date('M', mktime(0, 0, 0, $m, 1)),
            'students' => Student::where('institution_id', $institutionId)
                ->whereMonth('created_at', $m)->whereYear('created_at', now()->year)->count(),
            'fees' => Payment::where('institution_id', $institutionId)
                ->whereMonth('paid_at', $m)->whereYear('paid_at', now()->year)->sum('amount'),
        ]);

        return response()->json(['monthly' => $months]);
    }

    private function todayAttendanceRate(int $institutionId): float
    {
        $total   = Student::where('institution_id', $institutionId)->where('status', 'active')->count();
        $present = Attendance::where('institution_id', $institutionId)
            ->whereDate('date', today())->where('status', 'present')->count();
        return $total > 0 ? round(($present / $total) * 100, 1) : 0;
    }

    private function weeklyAttendance(int $institutionId): array
    {
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = now()->subDays($i);
            $total   = Student::where('institution_id', $institutionId)->where('status', 'active')->count();
            $present = Attendance::where('institution_id', $institutionId)
                ->whereDate('date', $date)->where('status', 'present')->count();
            $days[]  = [
                'date'  => $date->format('Y-m-d'),
                'label' => $date->format('D'),
                'rate'  => $total > 0 ? round(($present / $total) * 100, 1) : 0,
            ];
        }
        return $days;
    }
}
