<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1A2535; margin: 0; padding: 24px; }
  .header { text-align: center; border-bottom: 3px solid #1B6CA8; padding-bottom: 12px; margin-bottom: 16px; }
  .grid { display: flex; gap: 16px; margin-bottom: 16px; }
  .col { flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #1B6CA8; color: white; padding: 8px 12px; font-size: 11px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  td:last-child { text-align: right; }
  .net-box { background: #0D4C78; color: white; border-radius: 8px; padding: 14px; text-align: center; }
  .net-amount { font-size: 28px; font-weight: bold; }
</style>
</head>
<body>
<div class="header">
  <div style="font-size:20px;font-weight:bold;color:#1B6CA8">{{ $institution->name }}</div>
  <div style="font-size:14px;color:#0D4C78;margin-top:4px">SALARY PAYSLIP / तलब पर्ची</div>
  <div style="font-size:11px;color:#6B7A8D">{{ $payroll->month }}</div>
</div>

<div class="grid">
  <div class="col">
    <strong>{{ $staff->user->name }}</strong><br>
    <span style="color:#6B7A8D;font-size:11px">{{ $staff->designation }}</span><br>
    <span style="color:#6B7A8D;font-size:11px">{{ $staff->staff_number }}</span>
  </div>
  <div class="col" style="text-align:right">
    <span style="color:#6B7A8D;font-size:11px">Department:</span> {{ $staff->department?->name ?? '—' }}<br>
    <span style="color:#6B7A8D;font-size:11px">Employment:</span> {{ ucfirst($staff->employment_type) }}<br>
    <span style="color:#6B7A8D;font-size:11px">Status:</span> {{ ucfirst($payroll->status) }}
  </div>
</div>

<div class="grid">
  <div class="col">
    <table>
      <thead><tr><th>Earnings</th><th>Amount (NPR)</th></tr></thead>
      <tbody>
        <tr><td>Basic Salary</td><td>{{ number_format($payroll->basic, 2) }}</td></tr>
        @foreach($allowances as $k => $v)
        <tr><td>{{ ucfirst(str_replace('_',' ',$k)) }}</td><td>{{ number_format($v, 2) }}</td></tr>
        @endforeach
        <tr style="font-weight:bold;background:#F7FBFF"><td>Gross</td><td>{{ number_format($payroll->gross, 2) }}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="col">
    <table>
      <thead><tr><th>Deductions</th><th>Amount (NPR)</th></tr></thead>
      <tbody>
        @foreach($deductions as $k => $v)
        <tr><td>{{ ucfirst(str_replace('_',' ',$k)) }}</td><td>{{ number_format($v, 2) }}</td></tr>
        @endforeach
        <tr style="font-weight:bold;background:#F7FBFF"><td>Total Deductions</td><td>{{ number_format(array_sum($deductions), 2) }}</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="net-box">
  <div style="font-size:11px;opacity:0.8">Net Salary / खुद तलब</div>
  <div class="net-amount">NPR {{ number_format($payroll->net, 2) }}</div>
</div>

<div style="margin-top:24px;font-size:10px;color:#6B7A8D;text-align:center;border-top:1px solid #E5E7EB;padding-top:10px">
  Computer-generated payslip. No signature required. · EduNep
</div>
</body>
</html>
