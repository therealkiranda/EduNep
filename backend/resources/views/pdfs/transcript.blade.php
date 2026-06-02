<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1A2535; margin: 0; padding: 24px; }
  .header { text-align: center; border-bottom: 3px solid #1B6CA8; padding-bottom: 12px; margin-bottom: 16px; }
  h3 { color: #1B6CA8; margin: 14px 0 8px; font-size: 12px; border-left: 3px solid #C8A951; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #1B6CA8; color: white; padding: 6px 10px; font-size: 10px; }
  td { padding: 6px 10px; border-bottom: 1px solid #F3F4F6; }
  .footer { margin-top: 32px; display: flex; justify-content: space-around; }
  .sign { text-align: center; }
  .sign-line { border-top: 1px solid #1A2535; width: 100px; margin: 28px auto 4px; font-size: 10px; }
</style>
</head>
<body>
<div class="header">
  <div style="font-size:20px;font-weight:bold;color:#1B6CA8">{{ $institution->name }}</div>
  @if($institution->name_ne)<div style="font-size:11px;color:#6B7A8D">{{ $institution->name_ne }}</div>@endif
  <div style="font-size:13px;font-weight:bold;color:#0D4C78;margin-top:4px">ACADEMIC TRANSCRIPT</div>
</div>

<table style="margin-bottom:16px">
  <tr><td><strong>Student Name:</strong> {{ $student->user->name }}</td><td><strong>Admission No.:</strong> {{ $student->admission_number }}</td></tr>
  <tr><td><strong>Class:</strong> {{ $student->class?->name }}</td><td><strong>Generated:</strong> {{ $generated_at->format('M d, Y') }}</td></tr>
</table>

@foreach($grades as $termId => $termGrades)
@php $term = $termGrades->first()?->term; @endphp
<h3>{{ $term?->name ?? 'Term' }}</h3>
<table>
  <thead><tr><th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>GPA</th></tr></thead>
  <tbody>
    @foreach($termGrades as $g)
    <tr><td>{{ $g->subject?->name }}</td><td>{{ $g->ca_marks }}</td><td>{{ $g->exam_marks }}</td><td><strong>{{ $g->total }}</strong></td><td style="font-weight:bold;color:#1B6CA8">{{ $g->grade ?? '—' }}</td><td>{{ $g->gpa ?? '—' }}</td></tr>
    @endforeach
    <tr style="background:#F7FBFF;font-weight:bold"><td colspan="3">Term Average</td><td>{{ number_format($termGrades->avg('total'),1) }}</td><td>—</td><td>{{ number_format($termGrades->avg('gpa'),2) }}</td></tr>
  </tbody>
</table>
@endforeach

<div class="footer">
  <div class="sign"><div class="sign-line">Class Teacher</div></div>
  <div class="sign"><div class="sign-line">Registrar</div></div>
  <div class="sign"><div class="sign-line">Principal</div></div>
</div>
<div style="text-align:center;font-size:9px;color:#6B7A8D;margin-top:12px;border-top:1px solid #E5E7EB;padding-top:8px">
  Official academic transcript · {{ $institution->name }} · EduNep School Management System
</div>
</body>
</html>
