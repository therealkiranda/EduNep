<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1A2535; margin: 0; padding: 24px; }
  .header { text-align: center; border-bottom: 2px solid #1B6CA8; padding-bottom: 12px; margin-bottom: 16px; }
  .logo { font-size: 20px; font-weight: bold; color: #1B6CA8; }
  .title { font-size: 14px; color: #0D4C78; margin: 4px 0; }
  .receipt-no { background: #F7FBFF; border: 1px solid #C8E1F7; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #E5E7EB; }
  .info-label { color: #6B7A8D; }
  .info-value { font-weight: bold; }
  .amount-box { background: #0D4C78; color: white; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
  .amount { font-size: 28px; font-weight: bold; }
  .method { font-size: 11px; opacity: 0.8; margin-top: 4px; }
  .footer { text-align: center; font-size: 10px; color: #6B7A8D; margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 10px; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">{{ $institution->name }}</div>
  @if($institution->name_ne)<div style="font-size:11px;color:#6B7A8D">{{ $institution->name_ne }}</div>@endif
  <div class="title">PAYMENT RECEIPT / भुक्तानी रसिद</div>
</div>

<div class="receipt-no">
  <span><strong>Receipt No:</strong> {{ $payment->reference }}</span>
  <span><strong>Date:</strong> {{ $payment->paid_at?->format('M d, Y') }}</span>
</div>

<div class="info-row"><span class="info-label">Student Name:</span><span class="info-value">{{ $student->user->name }}</span></div>
<div class="info-row"><span class="info-label">Admission No.:</span><span class="info-value">{{ $student->admission_number }}</span></div>
<div class="info-row"><span class="info-label">Class:</span><span class="info-value">{{ $student->class?->name }}</span></div>
<div class="info-row"><span class="info-label">Invoice No.:</span><span class="info-value">#{{ $invoice->id }}</span></div>
<div class="info-row"><span class="info-label">Payment Method:</span><span class="info-value" style="text-transform:capitalize">{{ str_replace('_',' ',$payment->method) }}</span></div>
@if($payment->bank_name)<div class="info-row"><span class="info-label">Bank:</span><span class="info-value">{{ $payment->bank_name }}</span></div>@endif
@if($payment->gateway_ref)<div class="info-row"><span class="info-label">Gateway Ref:</span><span class="info-value">{{ $payment->gateway_ref }}</span></div>@endif

<div class="amount-box">
  <div class="amount">NPR {{ number_format($payment->amount, 2) }}</div>
  <div class="method">{{ strtoupper(str_replace('_',' ',$payment->method)) }} · PAID</div>
</div>

<div class="footer">
  <p>Thank you for your payment. This is a computer-generated receipt.</p>
  <p>EduNep · {{ $institution->name }} · {{ $institution->phone }}</p>
</div>
</body>
</html>
