<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; padding: 0; font-family: DejaVu Sans, sans-serif; }
  .card { width: 241px; height: 153px; background: linear-gradient(135deg, #0D4C78, #1B6CA8); color: white; border-radius: 10px; padding: 12px; box-sizing: border-box; position: relative; overflow: hidden; }
  .bg-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
  .school { font-size: 10px; font-weight: bold; letter-spacing: 0.5px; opacity: 0.9; }
  .label { font-size: 7px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px; }
  .value { font-size: 12px; font-weight: bold; }
  .bottom { position: absolute; bottom: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
  .badge { background: rgba(200,169,81,0.9); border-radius: 4px; padding: 2px 8px; font-size: 8px; font-weight: bold; color: #1A2535; }
</style>
</head>
<body>
<div class="card">
  <div class="bg-circle" style="width:80px;height:80px;top:-20px;right:-20px"></div>
  <div class="bg-circle" style="width:50px;height:50px;bottom:-10px;left:-10px"></div>
  <div class="school">{{ strtoupper($institution->name) }}</div>
  @if($institution->name_ne)<div style="font-size:8px;opacity:0.7;margin-bottom:8px">{{ $institution->name_ne }}</div>@endif
  <div style="margin-top:4px">
    <div class="label">Name</div>
    <div class="value">{{ $student->user->name }}</div>
  </div>
  <div style="margin-top:6px;display:flex;gap:16px">
    <div><div class="label">Admission No.</div><div style="font-size:10px;font-weight:bold">{{ $student->admission_number }}</div></div>
    <div><div class="label">Class</div><div style="font-size:10px;font-weight:bold">{{ $student->class?->name }}</div></div>
  </div>
  <div class="bottom">
    <div><div class="label">Valid Until</div><div style="font-size:9px">{{ $year + 1 }}</div></div>
    <div class="badge">STUDENT ID</div>
  </div>
</div>
</body>
</html>
