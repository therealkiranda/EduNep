<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Services\PdfService;
use App\Services\NepaliDateService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function __construct(private PdfService $pdf, private NepaliDateService $nepDate) {}

    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['user', 'class', 'section', 'parent'])
            ->where('institution_id', $request->user()->institution_id);

        if ($request->class_id)   $query->where('class_id', $request->class_id);
        if ($request->section_id) $query->where('section_id', $request->section_id);
        if ($request->status)     $query->where('status', $request->status);
        if ($request->search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )->orWhere('admission_number', 'like', "%{$request->search}%");
        }

        $students = $query->latest()->paginate($request->per_page ?? 20);
        return response()->json($students);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'phone'            => 'nullable|string|max:20',
            'class_id'         => 'required|exists:classes,id',
            'section_id'       => 'nullable|exists:sections,id',
            'gender'           => 'required|in:male,female,other',
            'dob'              => 'required|date',
            'blood_group'      => 'nullable|string|max:5',
            'nationality'      => 'nullable|string|max:100',
            'address'          => 'nullable|string',
            'parent_name'      => 'nullable|string|max:255',
            'parent_phone'     => 'nullable|string|max:20',
            'parent_email'     => 'nullable|email',
        ]);

        DB::beginTransaction();
        try {
            $admissionNo = $this->generateAdmissionNumber($request->user()->institution_id);
            $password    = Str::random(10);

            $user = User::create([
                'name'           => $request->name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'password'       => Hash::make($password),
                'institution_id' => $request->user()->institution_id,
                'language'       => 'ne',
            ]);
            $user->assignRole('student');

            $student = Student::create([
                'user_id'          => $user->id,
                'institution_id'   => $request->user()->institution_id,
                'admission_number' => $admissionNo,
                'class_id'         => $request->class_id,
                'section_id'       => $request->section_id,
                'gender'           => $request->gender,
                'dob'              => $request->dob,
                'blood_group'      => $request->blood_group,
                'nationality'      => $request->nationality ?? 'Nepali',
                'address'          => $request->address,
                'status'           => 'active',
            ]);

            DB::commit();
            return response()->json([
                'student'          => $student->load('user', 'class'),
                'temp_password'    => $password,
                'admission_number' => $admissionNo,
                'message'          => __('messages.student_created'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show(Student $student): JsonResponse
    {
        $student->load(['user', 'class', 'section', 'institution', 'grades', 'attendances']);
        return response()->json(['student' => $student]);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'class_id'    => 'sometimes|exists:classes,id',
            'section_id'  => 'sometimes|exists:sections,id',
            'blood_group' => 'sometimes|string|max:5',
            'address'     => 'sometimes|string',
            'status'      => 'sometimes|in:active,inactive,graduated,transferred',
        ]);

        $student->update($request->only('class_id', 'section_id', 'blood_group', 'address', 'status'));
        if ($request->has('name') || $request->has('phone')) {
            $student->user->update($request->only('name', 'phone'));
        }

        return response()->json(['student' => $student->load('user', 'class'), 'message' => __('messages.updated')]);
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->update(['status' => 'inactive']);
        return response()->json(['message' => __('messages.student_deactivated')]);
    }

    public function uploadPhoto(Request $request, Student $student): JsonResponse
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $path = $request->file('photo')->store("students/{$student->id}", 'public');
        $student->user->update(['avatar' => $path]);
        return response()->json(['avatar' => asset('storage/' . $path)]);
    }

    public function idCard(Student $student)
    {
        $student->load('user', 'class', 'institution');
        $pdf = $this->pdf->generateIdCard($student);
        return $pdf->download("id-card-{$student->admission_number}.pdf");
    }

    public function transcript(Student $student)
    {
        $student->load('user', 'class', 'institution', 'grades.subject');
        $pdf = $this->pdf->generateTranscript($student);
        return $pdf->download("transcript-{$student->admission_number}.pdf");
    }

    public function reportCard(Student $student)
    {
        $student->load('user', 'class', 'institution', 'grades.subject');
        $pdf = $this->pdf->generateReportCard($student);
        return $pdf->download("report-card-{$student->admission_number}.pdf");
    }

    public function promote(Request $request, Student $student): JsonResponse
    {
        $request->validate(['new_class_id' => 'required|exists:classes,id']);
        $old = $student->class_id;
        $student->update(['class_id' => $request->new_class_id, 'section_id' => $request->new_section_id]);
        return response()->json(['message' => __('messages.student_promoted'), 'from_class' => $old, 'to_class' => $request->new_class_id]);
    }

    public function transfer(Request $request, Student $student): JsonResponse
    {
        $request->validate(['reason' => 'required|string', 'transfer_certificate' => 'sometimes|file']);
        $student->update(['status' => 'transferred', 'transfer_reason' => $request->reason, 'transferred_at' => now()]);
        return response()->json(['message' => __('messages.student_transferred')]);
    }

    public function feeBalance(Student $student): JsonResponse
    {
        $total  = $student->invoices()->sum('net_amount');
        $paid   = $student->payments()->sum('amount');
        return response()->json(['total' => $total, 'paid' => $paid, 'balance' => $total - $paid]);
    }

    private function generateAdmissionNumber(int $institutionId): string
    {
        $year  = now()->year;
        $count = Student::where('institution_id', $institutionId)->whereYear('created_at', $year)->count() + 1;
        return "EDU-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
