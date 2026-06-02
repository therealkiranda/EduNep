<!DOCTYPE html>
<html lang="{{ $student->user->language ?? 'en' }}">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1A2535; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 3px solid #1B6CA8; padding-bottom: 12px; margin-bottom: 16px; }
  .logo { font-size: 22px; font-weight: bold; color: #1B6CA8; }
  .title { font-size: 16px; font-weight: bold; color: #0D4C78; margin: 4px 0; }
  .subtitle { font-size: 11px; color: #6B7A8D; }
  .info-grid { display: flex; gap: 20px; margin-bottom: 16px; }
  .info-box { background: #F7FBFF; border: 1px solid #C8E1F7; border-radius: 8px; padding: 10px 14px; flex: 1; }
  .info-label { font-size: 10px; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { font-size: 13px; font-weight: bold; color: #1A2535; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #1B6CA8; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
  td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; font-size: 11px; }
  tr:nth-child(even) td { background: #F7FBFF; }
  .grade-A { color: #065F46; font-weight: bold; }
  .grade-B { color: #1E40AF; font-weight: bold; }
  .grade-C { color: #92400E; font-weight: bold; }
  .grade-F { color: #991B1B; font-weight: bold; }
  .summary { background: #0D4C78; color: white; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; }
  .summary-item { text-align: center; }
  .summary-val { font-size: 18px; font-weight: bold; }
  .summary-lbl { font-size: 9px; opacity: 0.8; margin-top: 2px; }
  .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #6B7A8D; border-top: 1px solid #E5E7EB; padding-top: 10px; }
  .sign-line { border-top: 1px solid #1A2535; width: 120px; margin-top: 24px; padding-top: 4px; text-align: center; font-size: 10px; }
</style>
</head>
<body>
<div class="header">
  @if($institution->logo)
    <img src="{{ public_path('storage/'.$institution->logo) }}" height="50" style="margin-bottom:8px">
  @endif
  <div class="logo">{{ $institution->name }}</div>
  @if($institution->name_ne)<div class="subtitle">{{ $institution->name_ne }}</div>@endif
  <div class="title">STUDENT REPORT CARD / विद्यार्थी प्रगति पत्र</div>
  <div class="subtitle">{{ $term?->name }} · {{ $term?->academic_year?->name ?? date('Y') }}</div>
</div>

<div class="info-grid">
  <div class="info-box">
    <div class="info-label">Student Name</div>
    <div class="info-value">{{ $student->user->name }}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Admission No.</div>
    <div class="info-value">{{ $student->admission_number }}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Class</div>
    <div class="info-value">{{ $student->class?->name }} {{ $student->section?->name }}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Generated</div>
    <div class="info-value">{{ now()->format('M d, Y') }}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Subject</th>
      <th>CA Marks</th>
      <th>Exam Marks</th>
      <th>Total</th>
      <th>Grade</th>
      <th>GPA</th>
      <th>Remarks</th>
    </tr>
  </thead>
  <tbody>
    @foreach($grades as $grade)
    <tr>
      <td>{{ $grade->subject?->name }}</td>
      <td>{{ $grade->ca_marks }}</td>
      <td>{{ $grade->exam_marks }}</td>
      <td><strong>{{ $grade->total }}</strong></td>
      <td class="grade-{{ substr($grade->grade??'',0,1) }}">{{ $grade->grade ?? '—' }}</td>
      <td>{{ $grade->gpa ?? '—' }}</td>
      <td>{{ $grade->remarks ?? '' }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

<div class="summary">
  <div class="summary-item"><div class="summary-val">{{ number_format($gpa, 2) }}</div><div class="summary-lbl">GPA</div></div>
  <div class="summary-item"><div class="summary-val">{{ $total }}/{{ $max_total }}</div><div class="summary-lbl">Total Marks</div></div>
  <div class="summary-item"><div class="summary-val">{{ $grades->count() }}</div><div class="summary-lbl">Subjects</div></div>
  <div class="summary-item"><div class="summary-val">{{ $gpa >= 2.0 ? 'PASS' : 'FAIL' }}</div><div class="summary-lbl">Result</div></div>
</div>

<div class="footer">
  <div>
    <div class="sign-line">Class Teacher</div>
  </div>
  <div style="text-align:center">
    <p>This is a computer-generated report card.</p>
    <p>EduNep · {{ $institution->name }} · {{ $institution->address }}</p>
  </div>
  <div style="text-align:right">
    <div class="sign-line">Principal</div>
  </div>
</div>
</body>
</html>
