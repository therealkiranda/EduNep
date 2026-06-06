<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Staff;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayrollController extends Controller
{
    public function __construct(private PdfService $pdf) {}

    public function index(Request $request): JsonResponse
    {
        $payroll = Payroll::with('staff.user','staff.department')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->month,    fn($q) => $q->where('month', $request->month))
            ->when($request->status,   fn($q) => $q->where('status', $request->status))
            ->latest()->paginate(20);
        return response()->json($payroll);
    }

    public function run(Request $request): JsonResponse
    {
        $request->validate(['month' => 'required|string|regex:/^\d{4}-\d{2}$/']);
        $institutionId = $request->user()->institution_id;
        $staffList     = Staff::where('institution_id', $institutionId)->where('status','active')->get();
        $created       = 0;
        foreach ($staffList as $staff) {
            if (Payroll::where('staff_id', $staff->id)->where('month', $request->month)->exists()) continue;
            $allowances = ['house' => $staff->basic_salary * 0.1, 'transport' => 2000];
            $deductions = ['pf' => $staff->basic_salary * 0.1, 'tax' => max(0, ($staff->basic_salary - 20000) * 0.01)];
            $gross      = $staff->basic_salary + array_sum($allowances);
            $net        = $gross - array_sum($deductions);
            Payroll::create(['institution_id' => $institutionId, 'staff_id' => $staff->id,
                'month' => $request->month, 'basic' => $staff->basic_salary,
                'allowances' => $allowances, 'deductions' => $deductions,
                'gross' => $gross, 'net' => $net, 'status' => 'draft']);
            $created++;
        }
        return response()->json(['created' => $created, 'message' => "{$created} payslips generated for {$request->month}."]);
    }

    public function approve(Request $request, $id): JsonResponse
    {
        $payroll = Payroll::where('institution_id', $request->user()->institution_id)->findOrFail($id);
        $payroll->update(['status' => 'approved', 'approved_by' => $request->user()->id]);
        return response()->json(['message' => 'Payroll approved.', 'payroll' => $payroll]);
    }

    public function payslip(Request $request, $id)
    {
        $payroll = Payroll::with('staff.user','staff.institution','staff.department')
            ->where('institution_id', $request->user()->institution_id)->findOrFail($id);
        return $this->pdf->generatePayslip($payroll)->download("payslip-{$payroll->staff->staff_number}-{$payroll->month}.pdf");
    }
}
