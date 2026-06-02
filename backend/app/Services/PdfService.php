<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    public function generateIdCard(Student $student)
    {
        $data = [
            'student'     => $student,
            'institution' => $student->institution,
            'year'        => date('Y'),
        ];
        return Pdf::loadView('pdfs.id-card', $data)
            ->setPaper([0, 0, 241.89, 153.07]); // CR80 card size
    }

    public function generateReportCard(Student $student)
    {
        $grades  = $student->grades()->with('subject', 'term')->get();
        $term    = $student->institution->terms()->where('is_current', true)->first();
        $data    = [
            'student'     => $student,
            'institution' => $student->institution,
            'grades'      => $grades,
            'term'        => $term,
            'gpa'         => $grades->avg('gpa'),
            'total'       => $grades->sum('total'),
            'max_total'   => $grades->count() * 100,
        ];
        return Pdf::loadView('pdfs.report-card', $data)->setPaper('a4');
    }

    public function generateTranscript(Student $student)
    {
        $grades = $student->grades()->with('subject', 'term')->orderBy('term_id')->get();
        $data   = [
            'student'     => $student,
            'institution' => $student->institution,
            'grades'      => $grades->groupBy('term_id'),
            'generated_at'=> now(),
        ];
        return Pdf::loadView('pdfs.transcript', $data)->setPaper('a4');
    }

    public function generateReceipt(Payment $payment)
    {
        $data = [
            'payment'     => $payment,
            'student'     => $payment->student,
            'invoice'     => $payment->invoice,
            'institution' => $payment->student->institution,
            'generated_at'=> now(),
        ];
        return Pdf::loadView('pdfs.receipt', $data)->setPaper('a5');
    }

    public function generateInvoice($invoice)
    {
        $invoice->load('student.user', 'items', 'student.institution');
        $data = [
            'invoice'     => $invoice,
            'student'     => $invoice->student,
            'institution' => $invoice->student->institution,
            'items'       => $invoice->items,
        ];
        return Pdf::loadView('pdfs.invoice', $data)->setPaper('a4');
    }

    public function generatePayslip($payroll)
    {
        $payroll->load('staff.user', 'staff.institution');
        $data = [
            'payroll'     => $payroll,
            'staff'       => $payroll->staff,
            'institution' => $payroll->staff->institution,
            'allowances'  => $payroll->allowances ?? [],
            'deductions'  => $payroll->deductions ?? [],
        ];
        return Pdf::loadView('pdfs.payslip', $data)->setPaper('a4');
    }
}
