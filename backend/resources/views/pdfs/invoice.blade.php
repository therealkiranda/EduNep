<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1A2535; margin: 0; padding: 24px; }
  .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1B6CA8; padding-bottom: 14px; margin-bottom: 18px; }
  .inst-name { font-size: 20px; font-weight: bold; color: #1B6CA8; }
  .inv-title { text-align: right; }
  .inv-no { font-size: 18px; font-weight: bold; color: #0D4C78; }
  .student-box { background: #F7FBFF; border: 1px solid #C8E1F7; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #1B6CA8; color: white; padding: 8px 12px; font-size: 11px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  .totals { margin-left: auto; width: 220px; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #F3F4F6; }
  .grand-total { background: #0D4C78; color: white; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 4px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
  .status-paid { background: #D1FAE5; color: #065F46; }
  .status-unpaid { background: #FEE2E2; color: #991B1B; }
  .status-partial { background: #FEF3C7; color: #92400E; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="inst-name">{{ $institution->name }}</div>
    @if($institution->name_ne)<div style="font-size:11px;color:#6B7A8D">{{ $institution->name_ne }}</div>@endif
    <div style="font-size:11px;color:#6B7A8D;margin-top:4px">{{ $institution->address }} · {{ $institution->phone }}</div>
  </div>
  <div class="inv-title">
    <div style="color:#6B7A8D;font-size:11px">INVOICE / बिलपत्र</div>
    <div class="inv-no">#{{ $invoice->invoice_number }}</div>
    <div style="margin-top:6px"><span class="status-badge status-{{ $invoice->status }}">{{ $invoice->status }}</span></div>
    <div style="font-size:10px;color:#6B7A8D;margin-top:4px">Due: {{ $invoice->due_date?->format('M d, Y') }}</div>
  </div>
</div>

<div class="student-box">
  <strong>{{ $student->user->name }}</strong> · {{ $student->admission_number }}<br>
  <span style="color:#6B7A8D">{{ $student->class?->name }}{{ $student->section ? ' · Sec '.$student->section?->name : '' }}</span>
</div>

<table>
  <thead><tr><th>#</th><th>Description</th><th style="text-align:right">Amount (NPR)</th></tr></thead>
  <tbody>
    @foreach($items as $i => $item)
    <tr><td>{{ $i+1 }}</td><td>{{ $item->description }}</td><td style="text-align:right">{{ number_format($item->amount, 2) }}</td></tr>
    @endforeach
  </tbody>
</table>

<div style="display:flex;justify-content:flex-end">
  <div class="totals">
    <div class="total-row"><span>Subtotal:</span><span>NPR {{ number_format($invoice->total_amount, 2) }}</span></div>
    @if($invoice->discount > 0)
    <div class="total-row" style="color:#10B981"><span>Discount:</span><span>- NPR {{ number_format($invoice->discount, 2) }}</span></div>
    @endif
    <div class="grand-total"><span>Total:</span><span>NPR {{ number_format($invoice->net_amount, 2) }}</span></div>
  </div>
</div>

<div style="margin-top:24px;font-size:10px;color:#6B7A8D;text-align:center;border-top:1px solid #E5E7EB;padding-top:10px">
  This is a computer-generated invoice. · EduNep School Management System
</div>
</body>
</html>
