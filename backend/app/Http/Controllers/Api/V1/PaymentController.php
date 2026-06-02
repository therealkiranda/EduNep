<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private PdfService $pdf) {}

    // ─── CASH ────────────────────────────────────────────────────────────
    public function recordCash(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount'     => 'required|numeric|min:1',
            'note'       => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);
        $payment = Payment::create([
            'institution_id' => $request->user()->institution_id,
            'invoice_id'     => $invoice->id,
            'student_id'     => $invoice->student_id,
            'amount'         => $request->amount,
            'method'         => 'cash',
            'reference'      => 'CASH-' . strtoupper(Str::random(8)),
            'note'           => $request->note,
            'status'         => 'completed',
            'paid_at'        => now(),
            'recorded_by'    => $request->user()->id,
        ]);

        $this->updateInvoiceStatus($invoice);

        return response()->json([
            'payment' => $payment->load('invoice', 'student.user'),
            'message' => __('messages.payment_recorded'),
        ], 201);
    }

    // ─── BANK TRANSFER ───────────────────────────────────────────────────
    public function recordBank(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id'  => 'required|exists:invoices,id',
            'amount'      => 'required|numeric|min:1',
            'reference'   => 'required|string',
            'bank_name'   => 'nullable|string',
            'deposited_at'=> 'nullable|date',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);
        $payment = Payment::create([
            'institution_id' => $request->user()->institution_id,
            'invoice_id'     => $invoice->id,
            'student_id'     => $invoice->student_id,
            'amount'         => $request->amount,
            'method'         => 'bank_transfer',
            'reference'      => $request->reference,
            'bank_name'      => $request->bank_name,
            'status'         => 'completed',
            'paid_at'        => $request->deposited_at ?? now(),
            'recorded_by'    => $request->user()->id,
        ]);

        $this->updateInvoiceStatus($invoice);

        return response()->json(['payment' => $payment, 'message' => __('messages.payment_recorded')], 201);
    }

    // ─── ESEWA ───────────────────────────────────────────────────────────
    public function esewaInit(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount'     => 'required|numeric|min:1',
        ]);

        $invoice   = Invoice::findOrFail($request->invoice_id);
        $productId = 'EDUNEP-INV-' . $invoice->id . '-' . time();

        // Store pending payment
        $payment = Payment::create([
            'institution_id' => $request->user()->institution_id,
            'invoice_id'     => $invoice->id,
            'student_id'     => $invoice->student_id,
            'amount'         => $request->amount,
            'method'         => 'esewa',
            'reference'      => $productId,
            'status'         => 'pending',
            'recorded_by'    => $request->user()->id,
        ]);

        $isLive   = config('services.esewa.env') === 'live';
        $baseUrl  = $isLive ? 'https://esewa.com.np' : 'https://uat.esewa.com.np';

        return response()->json([
            'payment_id'    => $payment->id,
            'product_id'    => $productId,
            'amount'        => $request->amount,
            'esewa_url'     => $baseUrl . '/epay/main',
            'merchant_code' => config('services.esewa.merchant_code'),
            'success_url'   => config('app.url') . '/api/v1/payments/esewa/callback',
            'failure_url'   => config('app.url') . '/api/v1/payments/esewa/callback',
        ]);
    }

    public function esewaCallback(Request $request): JsonResponse
    {
        $oid    = $request->oid;
        $amt    = $request->amt;
        $refId  = $request->refId;
        $status = $request->status ?? 'COMPLETE';

        $payment = Payment::where('reference', $oid)->first();
        if (! $payment) return response()->json(['message' => 'Payment not found'], 404);

        if ($status === 'COMPLETE') {
            // Verify with eSewa
            $isLive  = config('services.esewa.env') === 'live';
            $baseUrl = $isLive ? 'https://esewa.com.np' : 'https://uat.esewa.com.np';
            $verify  = Http::get("{$baseUrl}/epay/transrec", [
                'amt'  => $amt, 'scd'  => config('services.esewa.merchant_code'),
                'rid'  => $refId, 'pid' => $oid,
            ]);

            if (str_contains($verify->body(), 'Success')) {
                $payment->update(['status' => 'completed', 'paid_at' => now(), 'gateway_ref' => $refId]);
                $this->updateInvoiceStatus($payment->invoice);
                return response()->json(['message' => 'Payment verified', 'payment' => $payment]);
            }
        }

        $payment->update(['status' => 'failed']);
        return response()->json(['message' => 'Payment failed'], 400);
    }

    // ─── KHALTI ──────────────────────────────────────────────────────────
    public function khaltiInit(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount'     => 'required|numeric|min:1',
        ]);

        $invoice   = Invoice::findOrFail($request->invoice_id);
        $isLive    = config('services.khalti.env') === 'live';
        $baseUrl   = $isLive ? 'https://khalti.com/api/v2' : 'https://a.khalti.com/api/v2';

        $response  = Http::withHeaders([
            'Authorization' => 'Key ' . config('services.khalti.secret_key'),
        ])->post("{$baseUrl}/epayment/initiate/", [
            'return_url'    => config('app.url') . '/api/v1/payments/khalti/callback',
            'website_url'   => config('app.url'),
            'amount'        => $request->amount * 100, // paisa
            'purchase_order_id'   => 'EDUNEP-INV-' . $invoice->id . '-' . time(),
            'purchase_order_name' => 'EduNep Fee Payment - Invoice #' . $invoice->id,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            Payment::create([
                'institution_id' => $request->user()->institution_id,
                'invoice_id'     => $invoice->id,
                'student_id'     => $invoice->student_id,
                'amount'         => $request->amount,
                'method'         => 'khalti',
                'reference'      => $data['purchase_order_id'],
                'status'         => 'pending',
                'recorded_by'    => $request->user()->id,
            ]);
            return response()->json(['payment_url' => $data['payment_url'], 'pidx' => $data['pidx']]);
        }

        return response()->json(['message' => 'Failed to initiate Khalti payment'], 500);
    }

    public function khaltiVerify(Request $request): JsonResponse
    {
        $request->validate(['pidx' => 'required|string']);
        $isLive  = config('services.khalti.env') === 'live';
        $baseUrl = $isLive ? 'https://khalti.com/api/v2' : 'https://a.khalti.com/api/v2';

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . config('services.khalti.secret_key'),
        ])->post("{$baseUrl}/epayment/lookup/", ['pidx' => $request->pidx]);

        if ($response->successful() && $response->json('status') === 'Completed') {
            $data    = $response->json();
            $payment = Payment::where('reference', $data['purchase_order_id'])->first();
            if ($payment) {
                $payment->update(['status' => 'completed', 'paid_at' => now(), 'gateway_ref' => $request->pidx]);
                $this->updateInvoiceStatus($payment->invoice);
                return response()->json(['message' => 'Payment verified', 'payment' => $payment]);
            }
        }

        return response()->json(['message' => 'Payment not verified'], 400);
    }

    public function khaltiCallback(Request $request): JsonResponse
    {
        return $this->khaltiVerify($request);
    }

    // ─── HISTORY & RECEIPT ───────────────────────────────────────────────
    public function history(Request $request): JsonResponse
    {
        $payments = Payment::with('student.user', 'invoice')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->method, fn($q) => $q->where('method', $request->method))
            ->when($request->from, fn($q) => $q->whereDate('paid_at', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->whereDate('paid_at', '<=', $request->to))
            ->latest('paid_at')->paginate(20);

        return response()->json($payments);
    }

    public function receipt(Payment $payment)
    {
        $payment->load('student.user', 'invoice', 'invoice.items');
        $pdf = $this->pdf->generateReceipt($payment);
        return $pdf->download("receipt-{$payment->reference}.pdf");
    }

    private function updateInvoiceStatus(Invoice $invoice): void
    {
        $invoice->refresh();
        $paid = $invoice->payments()->where('status', 'completed')->sum('amount');
        if ($paid >= $invoice->net_amount) {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        } elseif ($paid > 0) {
            $invoice->update(['status' => 'partial']);
        }
    }
}
