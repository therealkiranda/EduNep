<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $leaves = Leave::with('user','reviewer')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->status,  fn($q) => $q->where('status', $request->status))
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->latest()->paginate(20);
        return response()->json($leaves);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['type' => 'required|in:sick,casual,annual,maternity,paternity,unpaid',
            'start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000']);
        $days  = now()->parse($request->start_date)->diffInDays($request->end_date) + 1;
        $leave = Leave::create([...$request->only('type','start_date','end_date','reason'),
            'institution_id' => $request->user()->institution_id,
            'user_id' => $request->user()->id, 'days' => $days, 'status' => 'pending']);
        return response()->json(['leave' => $leave, 'message' => 'Leave applied successfully.'], 201);
    }

    public function show(Leave $leave): JsonResponse { return response()->json(['leave' => $leave->load('user')]); }
    public function update(Request $request, Leave $leave): JsonResponse
    {
        $leave->update($request->only('type','start_date','end_date','reason'));
        return response()->json(['leave' => $leave, 'message' => __('messages.updated')]);
    }
    public function destroy(Leave $leave): JsonResponse { $leave->delete(); return response()->json(['message' => __('messages.deleted')]); }

    public function approve(Request $request, Leave $leave): JsonResponse
    {
        $leave->update(['status' => 'approved', 'reviewed_by' => $request->user()->id,
            'review_note' => $request->note, 'reviewed_at' => now()]);
        return response()->json(['message' => 'Leave approved.', 'leave' => $leave]);
    }

    public function reject(Request $request, Leave $leave): JsonResponse
    {
        $request->validate(['note' => 'required|string']);
        $leave->update(['status' => 'rejected', 'reviewed_by' => $request->user()->id,
            'review_note' => $request->note, 'reviewed_at' => now()]);
        return response()->json(['message' => 'Leave rejected.', 'leave' => $leave]);
    }
}
