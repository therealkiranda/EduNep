<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    public function __construct(private PdfService $pdf) {}

    public function index(Request $request): JsonResponse
    {
        $query = Staff::with(['user', 'department'])
            ->where('institution_id', $request->user()->institution_id);

        if ($request->department_id)    $query->where('department_id', $request->department_id);
        if ($request->employment_type)  $query->where('employment_type', $request->employment_type);
        if ($request->status)           $query->where('status', $request->status);
        if ($request->search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )->orWhere('staff_number', 'like', "%{$request->search}%");
        }

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'phone'           => 'nullable|string|max:20',
            'department_id'   => 'nullable|exists:departments,id',
            'designation'     => 'required|string|max:255',
            'designation_ne'  => 'nullable|string|max:255',
            'employment_type' => 'required|in:permanent,temporary,contract,part_time',
            'join_date'       => 'nullable|date',
            'basic_salary'    => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $staffNo  = $this->generateStaffNumber($request->user()->institution_id);
            $password = Str::random(10);

            $user = User::create([
                'name'           => $request->name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'password'       => Hash::make($password),
                'institution_id' => $request->user()->institution_id,
            ]);
            $user->assignRole($request->role ?? 'teacher');

            $staff = Staff::create([
                'user_id'         => $user->id,
                'institution_id'  => $request->user()->institution_id,
                'department_id'   => $request->department_id,
                'staff_number'    => $staffNo,
                'designation'     => $request->designation,
                'designation_ne'  => $request->designation_ne,
                'employment_type' => $request->employment_type,
                'join_date'       => $request->join_date,
                'basic_salary'    => $request->basic_salary ?? 0,
                'status'          => 'active',
            ]);

            DB::commit();
            return response()->json([
                'staff'         => $staff->load('user', 'department'),
                'temp_password' => $password,
                'staff_number'  => $staffNo,
                'message'       => __('messages.created'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show(Staff $staff): JsonResponse
    {
        return response()->json(['staff' => $staff->load('user', 'department', 'institution')]);
    }

    public function update(Request $request, Staff $staff): JsonResponse
    {
        $request->validate([
            'designation'     => 'sometimes|string|max:255',
            'department_id'   => 'sometimes|exists:departments,id',
            'employment_type' => 'sometimes|in:permanent,temporary,contract,part_time',
            'basic_salary'    => 'sometimes|numeric|min:0',
            'status'          => 'sometimes|in:active,inactive,resigned,terminated',
        ]);

        $staff->update($request->only('designation','designation_ne','department_id','employment_type','basic_salary','salary_grade','status'));
        if ($request->has('name') || $request->has('phone')) {
            $staff->user->update($request->only('name', 'phone'));
        }

        return response()->json(['staff' => $staff->load('user', 'department'), 'message' => __('messages.updated')]);
    }

    public function destroy(Staff $staff): JsonResponse
    {
        $staff->update(['status' => 'inactive']);
        return response()->json(['message' => __('messages.updated')]);
    }

    public function uploadPhoto(Request $request, Staff $staff): JsonResponse
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $path = $request->file('photo')->store("staff/{$staff->id}", 'public');
        $staff->user->update(['avatar' => $path]);
        return response()->json(['avatar' => asset('storage/' . $path)]);
    }

    public function idCard(Staff $staff)
    {
        $staff->load('user', 'department', 'institution');
        $pdf = $this->pdf->generateIdCard($staff);
        return $pdf->download("id-card-{$staff->staff_number}.pdf");
    }

    public function payslips(Staff $staff): JsonResponse
    {
        $payslips = $staff->payrolls()->latest()->paginate(12);
        return response()->json($payslips);
    }

    private function generateStaffNumber(int $institutionId): string
    {
        $year  = now()->year;
        $count = Staff::where('institution_id', $institutionId)->whereYear('created_at', $year)->count() + 1;
        return "STF-{$year}-" . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
