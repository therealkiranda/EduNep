<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\InvoiceItem;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class FeeController extends Controller
{
    public function __construct(private PdfService $pdf) {}

    public function index(Request $request): JsonResponse
    {
        $structures = FeeStructure::where('institution_id', $request->user()->institution_id)
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->with('class')->latest()->get();
        return response()->json(['data' => $structures]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'amount'    => 'required|numeric|min:0',
            'class_id'  => 'nullable|exists:classes,id',
            'term_id'   => 'nullable|exists:terms,id',
            'frequency' => 'required|in:once,monthly,termly,yearly',
        ]);
        $fee = FeeStructure::create([...$request->only('name','name_ne','amount','class_id','term_id','frequency','is_mandatory'),
            'institution_id' => $request->user()->institution_id]);
        return response()->json(['data' => $fee, 'message' => __('messages.created')], 201);
    }

    public function show(FeeStructure $feeStructure): JsonResponse
    {
        $this->checkTenant($feeStructure, request()->user());
        return response()->json(['data' => $feeStructure]);
    }

    public function update(Request $request, FeeStructure $feeStructure): JsonResponse
    {
        $this->checkTenant($feeStructure, $request->user());
        $feeStructure->update($request->only('name','name_ne','amount','frequency','is_mandatory'));
        return response()->json(['data' => $feeStructure, 'message' => __('messages.updated')]);
    }

    public function destroy(FeeStructure $feeStructure): JsonResponse
    {
        $this->checkTenant($feeStructure, request()->user());
        $feeStructure->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $invoices = Invoice::with('student.user','term','items')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->status,     fn($q) => $q->where('status', $request->status))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->latest()->paginate(20);
        return response()->json($invoices);
    }

    public function invoice(Request $request, $id): JsonResponse
    {
        $invoice = Invoice::with('student.user','items','payments')
            ->where('institution_id', $request->user()->institution_id)->findOrFail($id);
        return response()->json(['data' => $invoice]);
    }

    public function invoicePdf(Request $request, $id)
    {
        $invoice = Invoice::with('student.user','items','student.institution')->findOrFail($id);
        return $this->pdf->generateInvoice($invoice)->download("invoice-{$invoice->invoice_number}.pdf");
    }

    public function generateInvoices(Request $request): JsonResponse
    {
        $request->validate(['class_id' => 'required|exists:classes,id', 'term_id' => 'required|exists:terms,id', 'due_date' => 'required|date']);
        $institutionId = $request->user()->institution_id;
        $structures    = FeeStructure::where('institution_id', $institutionId)
            ->where(fn($q) => $q->where('class_id', $request->class_id)->orWhereNull('class_id'))
            ->where('term_id', $request->term_id)->get();
        $students = Student::where('institution_id', $institutionId)->where('class_id', $request->class_id)->where('status','active')->get();
        $created  = 0;
        foreach ($students as $student) {
            if (Invoice::where('student_id', $student->id)->where('term_id', $request->term_id)->exists()) continue;
            $total   = $structures->sum('amount');
            $invoice = Invoice::create(['institution_id' => $institutionId, 'student_id' => $student->id,
                'term_id' => $request->term_id, 'invoice_number' => 'INV-'.strtoupper(Str::random(8)),
                'total_amount' => $total, 'discount' => 0, 'net_amount' => $total,
                'due_date' => $request->due_date, 'status' => 'unpaid']);
            foreach ($structures as $s) {
                InvoiceItem::create(['invoice_id' => $invoice->id, 'fee_structure_id' => $s->id,
                    'description' => $s->name, 'amount' => $s->amount]);
            }
            $created++;
        }
        return response()->json(['created' => $created, 'message' => "{$created} invoices generated."]);
    }

    public function studentBalance(Request $request, $studentId): JsonResponse
    {
        $student = Student::where('institution_id', $request->user()->institution_id)->findOrFail($studentId);
        $total   = $student->invoices()->sum('net_amount');
        $paid    = $student->payments()->where('status','completed')->sum('amount');
        return response()->json(['total' => $total, 'paid' => $paid, 'balance' => $total - $paid,
            'invoices' => $student->invoices()->with('items','payments')->latest()->get()]);
    }

    public function defaulters(Request $request): JsonResponse
    {
        $defaulters = Invoice::with('student.user','student.class')
            ->where('institution_id', $request->user()->institution_id)
            ->where('status','unpaid')->where('due_date','<', now())
            ->latest()->paginate(20);
        return response()->json($defaulters);
    }

    private function checkTenant($model, $user): void
    {
        if ($model->institution_id !== $user->institution_id) abort(403);
    }
}
